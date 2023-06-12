export function isPlainObject(value) {
    return value !== null && typeof value === 'object' && value.constructor.name === 'Object';
}
export function isPlainArray(value) {
    return Array.isArray(value) && value.constructor.name === 'Array';
}
export function softClone(obj) {
    const values = {};
    Object.keys(obj).forEach((prop) => {
        const value = obj[prop];
        if (isPlainObject(value)) {
            values[prop] = softClone(value);
        }
        else if (isPlainArray(value)) {
            values[prop] = value.map((b) => (isPlainObject(b) ? softClone(b) : b));
        }
        else {
            values[prop] = value;
        }
    });
    return values;
}
