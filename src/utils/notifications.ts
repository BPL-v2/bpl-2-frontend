export function sendWarning(message: string) {
  const event = new CustomEvent("warning", {
    detail: message,
  });
  window.dispatchEvent(event);
}

export function sendSuccess(message: string) {
  const event = new CustomEvent("success", {
    detail: message,
  });
  window.dispatchEvent(event);
}
