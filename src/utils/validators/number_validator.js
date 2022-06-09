export function hasValueError(value) {
  return value === undefined || /^[-+]?(\d+)$/.test(value);
}
