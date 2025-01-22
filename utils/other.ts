export { deleteEmptyProperties, blobToBase64 };

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
  const newObj = { ...obj };
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

/**
 * Converts a Blob object to a Base64-encoded string.
 *
 * @param {Blob} blob - The Blob object to convert.
 * @returns {Promise<string>} A promise that resolves to a Base64-encoded string representation of the Blob.
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result?.toString().split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
