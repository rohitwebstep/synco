function toReadableFieldName(field) {
    return field
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b\w/g, char => char.toUpperCase());
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidURL(value) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

function isValidPhone(value) {
    return /^[\d\s()+-]{7,15}$/.test(value);
}

function validateFormData(formData, options = {}) {
    const requiredFields = options.requiredFields || [];
    const patternValidations = options.patternValidations || {};
    const fileExtensionValidations = options.fileExtensionValidations || {};

    const error = {};

    // 1. Required field validation
    for (const field of requiredFields) {
        const value = formData[field];
        if (
            value === undefined ||
            value === null ||
            (typeof value === 'string' && value.trim() === '')
        ) {
            error[field] = `${toReadableFieldName(field)} is required.`;
        }
    }

    // 2. Pattern validations
    for (const field in patternValidations) {
        const rule = patternValidations[field];
        const value = formData[field];

        if (value !== undefined && value !== null) {
            const val = typeof value === 'string' ? value.trim() : value;
            const valStr = val.toString().toLowerCase();

            let isValid = true;

            switch (rule) {
                case 'email':
                    isValid = isValidEmail(val);
                    break;
                case 'number':
                    isValid = !isNaN(Number(val));
                    break;
                case 'boolean':
                    isValid = ['true', 'false', '1', '0', 'yes', 'no', 'active', 'inactive'].includes(valStr);
                    break;
                case 'url':
                    isValid = isValidURL(val);
                    break;
                case 'phone':
                    isValid = isValidPhone(val);
                    break;
                default:
                    // No pattern check for unknown rule
                    break;
            }

            if (!isValid) {
                error[field] = `${toReadableFieldName(field)} must be a valid ${rule}.`;
            }
        }
    }

    // 3. File extension validations
    for (const field in fileExtensionValidations) {
        const allowedExtensions = fileExtensionValidations[field];
        const file = formData[field];

        if (file && file.originalname) {
            const fileName = file.originalname.toLowerCase();
            const fileExtension = fileName.split('.').pop() || '';
            const isAllowed = allowedExtensions.map(ext => ext.toLowerCase()).includes(fileExtension);
            if (!isAllowed) {
                error[field] = `${toReadableFieldName(field)} must be one of: ${allowedExtensions.join(', ')}.`;
            }
        } else if (file !== undefined) {
            error[field] = `${toReadableFieldName(field)} must be a valid file.`;
        }
    }

    const errorCount = Object.keys(error).length;

    return {
        isValid: errorCount === 0,
        ...(errorCount > 0 && { error }),
        message:
            errorCount === 0
                ? 'Form submitted successfully.'
                : `Form contains ${errorCount} validation error${errorCount > 1 ? 's' : ''}.`,
    };
}

module.exports = { validateFormData };
