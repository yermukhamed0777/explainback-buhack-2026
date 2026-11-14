export function escape(value = "") {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
const paths = {
  book: '<path d="M3 4h7a3 3 0 0 1 3 3v14a4 4 0 0 0-4-3H3z"/><path d="M21 4h-5a3 3 0 0 0-3 3v14a4 4 0 0 1 4-3h3z"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
  chart: '<path d="M4 4v16h16M8 15v-4m5 4V7m5 8v-6"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6z"/><path d="m8 12 3 3 5-6"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 0 9M20 3v5h-5"/>',
  leaf: '<path d="M19 4C9 2 3 8 6 14s15 3 13-10ZM6 20l9-11"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
};
export function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
}
export function button(label, action, options = {}) {
  return `<button class="button ${options.secondary ? "secondary" : "primary"}" data-action="${action}" ${options.testid ? `data-testid="${options.testid}"` : ""} ${options.disabled ? "disabled" : ""}>${label}${options.arrow ? icon("arrow") : ""}</button>`;
}
export function rating(name, value, action) {
  const labels = [
    "New to it",
    "A little familiar",
    "Somewhat confident",
    "Confident",
    "Could teach it",
  ];
  return `<fieldset class="rating-field"><legend>${name}</legend><div class="rating-options">${labels.map((label, index) => `<button type="button" data-action="${action}" data-value="${index + 1}" aria-pressed="${index + 1 === value}" aria-label="${index + 1} out of 5: ${label}"><b>${index + 1}</b><span>${label}</span></button>`).join("")}</div></fieldset>`;
}
