function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function trimText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validateRegistration(input = {}) {
    const name = trimText(input.name);
    const email = normalizeEmail(input.email);
    const address = trimText(input.address);
    const password = typeof input.password === "string" ? input.password : "";
    const errors = [];

    if (name.length < 2 || name.length > 60) {
        errors.push("Name must be between 2 and 60 characters");
    }

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("A valid email address is required");
    }

    if (address.length < 1 || address.length > 400) {
        errors.push("Address must be between 1 and 400 characters");
    }

    if (password.length < 8 || Buffer.byteLength(password, "utf8") > 72) {
        errors.push("Password must be between 8 and 72 bytes");
    }

    return {
        errors,
        value: { name, email, address, password },
    };
}

function validateLogin(input = {}) {
    const email = normalizeEmail(input.email);
    const password = typeof input.password === "string" ? input.password : "";
    const errors = [];

    if (!email || !password) {
        errors.push("Email and password are required");
    }

    return {
        errors,
        value: { email, password },
    };
}

module.exports = {
    validateRegistration,
    validateLogin,
};
