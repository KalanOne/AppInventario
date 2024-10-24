export { deleteEmptyProperties };

/**
 * Deletes empty properties from an object.
 *
 * @param obj - The object to delete empty properties from.
 * @returns The object with empty properties deleted.
 * @example deleteEmptyProperties({ a: '', b: 'b', c: null }) // { b: 'b' }
 *
 */
function deleteEmptyProperties<T extends Record<string, any>>(
  obj: T
): { [K in keyof T]: NonNullable<T[K]> } {
  const newObj = { ...obj }; // Hacer una copia del objeto original
  for (const key in newObj) {
    if (Object.prototype.hasOwnProperty.call(newObj, key)) {
      const value = newObj[key];
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        delete newObj[key];
      }
    }
  }
  return newObj as { [K in keyof T]: NonNullable<T[K]> };
}
