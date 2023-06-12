"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.softClone = exports.isPlainArray = exports.isPlainObject = void 0;
function isPlainObject(value) {
    return value !== null && typeof value === 'object' && value.constructor.name === 'Object';
}
exports.isPlainObject = isPlainObject;
function isPlainArray(value) {
    return Array.isArray(value) && value.constructor.name === 'Array';
}
exports.isPlainArray = isPlainArray;
function softClone(obj) {
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
exports.softClone = softClone;
