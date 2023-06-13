export type AnyObject = Record<string, unknown>;

/**
 * Check if a value is a native JS object
 */
export function isPlainObject(value: unknown) {
  return value !== null && typeof value === 'object' && value.constructor.name === 'Object';
}

/**
 * Check if a value is a native JS array
 */
export function isPlainArray(value: unknown) {
  return Array.isArray(value) && value.constructor.name === 'Array';
}

/**
 * Deep clone object properties (traverse only native plain objects)
 */
export function softClone(obj: AnyObject) {
  const values: AnyObject = {};

  Object.keys(obj).forEach((prop) => {
    const value = obj[prop];

    if (isPlainObject(value)) {
      values[prop] = softClone(value as AnyObject);
    } else if (isPlainArray(value)) {
      values[prop] = (value as []).map((b) => (isPlainObject(b) ? softClone(b) : b));
    } else {
      values[prop] = value;
    }
  });

  return values;
}
