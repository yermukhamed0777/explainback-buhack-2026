import test from "node:test";
import assert from "node:assert/strict";
import { request } from "node:http";
import { createAppServer } from "../scripts/serve.mjs";

async function start(coach, options = {}) {
  const server = createAppServer(coach, { minCoachIntervalMs: 0, ...options });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    server,
    base: `http://127.0.0.1:${server.address().port}`,
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

const requestOptions = {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: "{}",
};

test("local API serves status, rejects cross-site traffic and leaves static files usable", async () => {
  let calls = 0;
  const server = createAppServer({
    status: async () => ({ available: true, model: "test-local" }),
    respond: async () => {
      calls++;
      return { question: "A locally generated question?" };
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(base)).status, 200);
    assert.equal(
      (await (await fetch(base + "/api/status")).json()).available,
      true,
    );
    assert.equal(
      (
        await fetch(base + "/api/coach", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "https://unrelated.example",
          },
          body: "{}",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(base + "/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{bad",
        })
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(base + "/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: "a".repeat(21000) }),
        })
      ).status,
      413,
    );
    assert.equal(
      (await fetch(base + "/api/coach", { method: "GET" })).status,
      405,
    );
    assert.equal(
      (
        await fetch(base + "/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        })
      ).status,
      200,
    );
    assert.equal(calls, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test("responses carry a self-only script policy and do not permit framing or referrer leakage", async () => {
  const app = await start({
    status: async () => ({ available: true }),
    respond: async () => ({}),
  });
  try {
    const response = await fetch(app.base);
    const policy = response.headers.get("content-security-policy");
    assert.match(policy, /script-src 'self'(?:;|$)/);
    assert.doesNotMatch(policy, /script-src[^;]*unsafe-inline/);
    assert.match(policy, /connect-src 'self'/);
    assert.match(policy, /img-src 'self' data:/);
    assert.equal(response.headers.get("x-frame-options"), "DENY");
    assert.equal(response.headers.get("referrer-policy"), "no-referrer");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  } finally {
    await app.close();
  }
});

test("Host rebinding, cross-site requests without Origin, and JSON lookalikes are rejected", async () => {
  const app = await start({
    status: async () => ({ available: true }),
    respond: async () => ({}),
  });
  try {
    const rebound = await new Promise((resolve, reject) => {
      const pending = request(
        app.base,
        { headers: { Host: "attacker.invalid" } },
        (response) => {
          response.resume();
          response.on("end", () => resolve(response.statusCode));
        },
      );
      pending.on("error", reject);
      pending.end();
    });
    assert.equal(rebound, 403);
    assert.equal(
      (
        await fetch(app.base + "/api/status", {
          headers: { "Sec-Fetch-Site": "cross-site" },
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await fetch(app.base + "/api/coach", {
          ...requestOptions,
          headers: { "Content-Type": "application/jsonp" },
        })
      ).status,
      415,
    );
  } finally {
    await app.close();
  }
});

test("concurrent status checks coalesce and cached status expires for recovery", async () => {
  let calls = 0;
  let available = false;
  const app = await start(
    {
      status: async () => {
        calls++;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { available };
      },
      respond: async () => ({}),
    },
    { statusCacheMs: 40 },
  );
  try {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        fetch(app.base + "/api/status").then((response) => response.json()),
      ),
    );
    assert.equal(calls, 1);
    assert.ok(responses.every((value) => value.available === false));
    available = true;
    assert.equal(
      (await (await fetch(app.base + "/api/status")).json()).available,
      false,
    );
    assert.equal(calls, 1);
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(
      (await (await fetch(app.base + "/api/status")).json()).available,
      true,
    );
    assert.equal(calls, 2);
  } finally {
    await app.close();
  }
});

test("a slow incomplete JSON upload ends with 408 before invoking the model", async () => {
  let calls = 0;
  const app = await start(
    {
      status: async () => ({ available: true }),
      respond: async () => {
        calls++;
        return {};
      },
    },
    { bodyTimeoutMs: 40 },
  );
  try {
    const response = await new Promise((resolve, reject) => {
      const pending = request(
        app.base + "/api/coach",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Transfer-Encoding": "chunked",
          },
        },
        (incoming) => {
          let body = "";
          incoming.on("data", (chunk) => {
            body += chunk;
          });
          incoming.on("end", () =>
            resolve({ code: incoming.statusCode, body }),
          );
        },
      );
      pending.on("error", reject);
      pending.write('{"answer":"');
      // Intentionally never end the body; the application deadline must respond.
    });
    assert.equal(response.code, 408);
    assert.match(response.body, /too long to upload/);
    assert.equal(calls, 0);
  } finally {
    await app.close();
  }
});

test("byte limits count split UTF-8 chunks before accumulating the entire body", async () => {
  let calls = 0;
  const app = await start(
    {
      status: async () => ({ available: true }),
      respond: async () => {
        calls++;
        return {};
      },
    },
    { maxBodyBytes: 64 },
  );
  try {
    const response = await new Promise((resolve, reject) => {
      const pending = request(
        app.base + "/api/coach",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Transfer-Encoding": "chunked",
          },
        },
        (incoming) => {
          incoming.resume();
          incoming.on("end", () => resolve(incoming.statusCode));
        },
      );
      pending.on("error", reject);
      const body = Buffer.from(JSON.stringify({ answer: "🧠".repeat(20) }));
      pending.write(body.subarray(0, 11));
      pending.write(body.subarray(11, 47));
      pending.end(body.subarray(47));
    });
    assert.equal(response, 413);
    assert.equal(calls, 0);
  } finally {
    await app.close();
  }
});

test("bounded local request budgets recover after the rate window", async () => {
  let calls = 0;
  const app = await start(
    {
      status: async () => ({ available: true }),
      respond: async () => {
        calls++;
        return {};
      },
    },
    { maxCoachRequests: 2, rateWindowMs: 60 },
  );
  try {
    assert.equal(
      (await fetch(app.base + "/api/coach", requestOptions)).status,
      200,
    );
    assert.equal(
      (await fetch(app.base + "/api/coach", requestOptions)).status,
      200,
    );
    const limited = await fetch(app.base + "/api/coach", requestOptions);
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "1");
    assert.equal(calls, 2);
    await new Promise((resolve) => setTimeout(resolve, 70));
    assert.equal(
      (await fetch(app.base + "/api/coach", requestOptions)).status,
      200,
    );
    assert.equal(calls, 3);
  } finally {
    await app.close();
  }
});

test("server deadline returns a recoverable response and aborts an unfinished inference", async () => {
  let wasAborted = false;
  const app = await start(
    {
      status: async () => ({ available: true }),
      respond: async (_input, signal) => {
        signal.addEventListener(
          "abort",
          () => {
            wasAborted = true;
          },
          { once: true },
        );
        await new Promise(() => {});
      },
    },
    { inferenceTimeoutMs: 40 },
  );
  try {
    const response = await fetch(app.base + "/api/coach", requestOptions);
    assert.equal(response.status, 504);
    assert.equal(wasAborted, true);
    assert.match((await response.json()).error, /answer is kept/);
  } finally {
    await app.close();
  }
});

test("only one model call runs at a time and cancelling a browser request aborts it", async () => {
  let started, aborted;
  const entered = new Promise((resolve) => {
    started = resolve;
  });
  const cancelled = new Promise((resolve) => {
    aborted = resolve;
  });
  const server = createAppServer({
    status: async () => ({ available: true }),
    respond: async (_input, signal) => {
      started();
      await new Promise((resolve, reject) =>
        signal.addEventListener(
          "abort",
          () => {
            aborted();
            reject(new Error("Cancelled"));
          },
          { once: true },
        ),
      );
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/coach`;
  const controller = new AbortController();
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  };
  try {
    const pending = fetch(url, { ...options, signal: controller.signal });
    const rejected = assert.rejects(pending);
    await entered;
    assert.equal((await fetch(url, options)).status, 503);
    controller.abort();
    await rejected;
    await Promise.race([
      cancelled,
      new Promise((_, reject) => {
        const timer = setTimeout(
          () => reject(new Error("Model was not aborted")),
          1000,
        );
        timer.unref();
      }),
    ]);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
