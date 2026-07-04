export function decodeObject(obj) {
  if (typeof obj === "string") {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = obj;
    return textarea.value;
  }

  if (Array.isArray(obj)) {
    return obj.map(decodeObject);
  }

  if (obj && typeof obj === "object") {
    const result = {};

    for (const key in obj) {
      result[key] = decodeObject(obj[key]);
    }

    return result;
  }

  return obj;
}