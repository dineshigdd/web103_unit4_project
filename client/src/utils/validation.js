// utils/validationUtils.js
export const validateRoofCompatibility = (isConvertible, selectedRoof) => {
    if (!selectedRoof) return "";

    const isOnlyForConvertible = selectedRoof.is_convertible === true;

    if (isConvertible && !isOnlyForConvertible) {
        return `${selectedRoof.name} is not compatible with Convertibles.`;
    } 
    
    if (!isConvertible && isOnlyForConvertible) {
        return `${selectedRoof.name} requires the Convertible package.`;
    }

    return ""; // No error
};