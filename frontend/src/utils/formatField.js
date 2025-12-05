export const formatField = (fieldItem) => {
    if (!fieldItem) return "—";
    if (Array.isArray(fieldItem)) {
        return fieldItem.length > 0 ? fieldItem.join(", ") : "—";
    }
    return fieldItem.toString();
};