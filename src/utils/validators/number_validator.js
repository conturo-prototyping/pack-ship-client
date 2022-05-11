export function hasValueError(value) {
  return /^[-+]?(\d+)$/.test(value);
}
