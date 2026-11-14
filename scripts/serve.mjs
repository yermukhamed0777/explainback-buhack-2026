import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createCoach, CoachError } from "./coach.mjs";

const root = path.resolve(fileURLToPath(new URL("../dist/", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};
const policy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
].join("; ");

function readJsonBody(req, { maxBodyBytes, bodyTimeoutMs }) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let bytes = 0;
    const finish = (error) => {
      clearTimeout(deadline);
      req.off("data", onData);
      req.off("end", onEnd);
      req.off("error", onError);
      req.off("aborted", onAbort);
      if (error) {
        // Stop retaining data immediately. The response closes rejected uploads.
        req.once("error", () => {});
        req.resume();
        reject(error);
      } else {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
        } catch {
          reject(
            new CoachError("The coaching request was not valid JSON.", 400),
          );
        }
      }
    };
    const onData = (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      bytes += buffer.byteLength;
      if (bytes > maxBodyBytes) {
        finish(new CoachError("This explanation is too long.", 413));
        return;
      }
      chunks.push(buffer);
    };
    const onEnd = () => finish();
    const onError = () =>
      finish(new CoachError("The coaching request was interrupted.", 400));
    const onAbort = () =>
      finish(new CoachError("The coaching request was interrupted.", 400));
    const deadline = setTimeout(
      () =>
        finish(
          new CoachError(
            "The request took too long to upload. Please try again.",
            408,
          ),
        ),
      bodyTimeoutMs,
    );
    deadline.unref();
    req.on("data", onData);
    req.once("end", onEnd);
    req.once("error", onError);
    req.once("aborted", onAbort);
  });
}

/** Local-user service. These limits do not make it suitable for network exposure. */
export function createAppServer(coach = createCoach(), options = {}) {
  const limits = {
    bodyTimeoutMs: 5000,
    maxBodyBytes: 20000,
    inferenceTimeoutMs: 55000,
    statusCacheMs: 3000,
    rateWindowMs: 60000,
    maxCoachRequests: 24,
    minCoachIntervalMs: 250,
    ...options,
  };
  let active = false;
  let statusPromise;
  let cachedStatus;
  let statusExpiresAt = 0;
  let requestTimes = [];
  let lastModelStart = -Infinity;

  async function status() {
    if (cachedStatus && Date.now() < statusExpiresAt) return cachedStatus;
    if (statusPromise) return statusPromise;
    statusPromise = Promise.resolve()
      .then(() => coach.status())
      .then(
        (result) => ({
          available: result?.available === true,
          ...(typeof result?.model === "string"
            ? { model: result.model.slice(0, 160) }
            : {}),
        }),
        () => ({ available: false }),
      )
      .then((result) => {
        cachedStatus = result;
        statusExpiresAt = Date.now() + limits.statusCacheMs;
        return result;
      })
      .finally(() => {
        statusPromise = undefined;
      });
    return statusPromise;
  }

  const server = createServer(async (req, res) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", policy);
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()",
    );
    const json = (code, body, headers = {}) => {
      if (res.destroyed || res.writableEnded) return;
      const closeUpload =
        code === 408 ||
        code === 413 ||
        (req.method === "POST" && !req.complete);
      res.writeHead(code, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        ...(closeUpload ? { Connection: "close" } : {}),
        ...headers,
      });
      res.end(JSON.stringify(body), () => {
        if (closeUpload) req.destroy();
      });
    };

    // A Host allowlist also rejects DNS-rebound domain names. Native local
    // clients may omit Origin; unrelated websites may not use this API.
    if (
      !/^((localhost|127\.0\.0\.1)(:\d+)?|\[::1\](:\d+)?)$/.test(
        req.headers.host || "",
      )
    ) {
      return json(403, {
        error: "Open this demo using its localhost address.",
      });
    }
    if (
      (req.headers.origin &&
        req.headers.origin !== `http://${req.headers.host}`) ||
      req.headers["sec-fetch-site"] === "cross-site"
    ) {
      return json(403, { error: "Cross-site requests are not allowed." });
    }

    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      if (pathname === "/api/status" && req.method === "GET")
        return json(200, await status());
      if (pathname === "/api/coach") {
        if (req.method !== "POST")
          return json(
            405,
            { error: "Use POST for coaching." },
            { Allow: "POST" },
          );
        if (
          !/^application\/json(?:\s*;|$)/i.test(
            req.headers["content-type"] || "",
          )
        ) {
          return json(415, { error: "Send JSON for coaching." });
        }
        if (active)
          return json(
            503,
            {
              error:
                "Pip is finishing another request. Please try again shortly.",
            },
            { "Retry-After": "1" },
          );

        const now = Date.now();
        requestTimes = requestTimes.filter(
          (time) => now - time < limits.rateWindowMs,
        );
        if (requestTimes.length >= limits.maxCoachRequests) {
          const retry = Math.max(
            1,
            Math.ceil((limits.rateWindowMs - (now - requestTimes[0])) / 1000),
          );
          return json(
            429,
            { error: "Pip needs a short break. Please try again shortly." },
            { "Retry-After": String(retry) },
          );
        }
        requestTimes.push(now);
        if (Number(req.headers["content-length"]) > limits.maxBodyBytes) {
          return json(413, { error: "This explanation is too long." });
        }
        const input = await readJsonBody(req, limits);
        if (res.destroyed) return;
        if (active)
          return json(
            503,
            {
              error:
                "Pip is finishing another request. Please try again shortly.",
            },
            { "Retry-After": "1" },
          );
        if (Date.now() - lastModelStart < limits.minCoachIntervalMs) {
          return json(
            429,
            { error: "Please wait a moment before trying again." },
            { "Retry-After": "1" },
          );
        }

        const controller = new AbortController();
        const onClose = () => {
          if (!res.writableEnded) controller.abort();
        };
        res.once("close", onClose);
        active = true;
        lastModelStart = Date.now();
        let timer;
        try {
          const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => {
              reject(
                new CoachError(
                  "Pip took too long to respond. Your answer is kept; please retry or continue with the lesson explanation.",
                  504,
                ),
              );
              controller.abort();
            }, limits.inferenceTimeoutMs);
            timer.unref();
          });
          return json(
            200,
            await Promise.race([
              coach.respond(input, controller.signal),
              timeout,
            ]),
          );
        } finally {
          clearTimeout(timer);
          res.off("close", onClose);
          active = false;
        }
      }
      if (pathname.startsWith("/api/"))
        return json(404, { error: "This coaching endpoint does not exist." });
      if (!["GET", "HEAD"].includes(req.method))
        return json(
          405,
          { error: "Method not allowed." },
          { Allow: "GET, HEAD" },
        );
      const filename = path.resolve(
        root,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      if (!filename.startsWith(root + path.sep))
        return json(403, { error: "Forbidden" });
      let data;
      try {
        data = await readFile(filename);
      } catch {
        return json(404, { error: "File not found." });
      }
      res.writeHead(200, {
        "Content-Type":
          types[path.extname(filename)] || "application/octet-stream",
      });
      res.end(req.method === "HEAD" ? undefined : data);
    } catch (error) {
      if (res.destroyed) return;
      if (error instanceof CoachError)
        return json(error.status, { error: error.message });
      return json(502, {
        error:
          "The local tutor could not finish. Check that Ollama is running, then retry. Your answer is kept.",
      });
    }
  });
  server.headersTimeout = Math.min(10000, limits.bodyTimeoutMs + 1000);
  server.requestTimeout = limits.bodyTimeoutMs + 1000;
  server.keepAliveTimeout = 5000;
  server.maxHeadersCount = 40;
  return server;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  createAppServer().listen(4173, "127.0.0.1", () =>
    console.log(
      "ExplainBack is running at http://127.0.0.1:4173 — local GPT-OSS coaching enabled when Ollama is available.",
    ),
  );
}
