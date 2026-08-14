const { validateRegistration } = require("./authValidator");

const ADMIN_CREATABLE_ROLES = new Set(["USER", "ADMIN"]);
const USER_SORT_COLUMNS = new Set([
    "id",
    "name",
    "email",
    "address",
    "role",
    "created_at",
    "updated_at",
]);
const STORE_SORT_COLUMNS = new Set([
    "id",
    "name",
    "email",
    "address",
    "owner_name",
    "created_at",
    "updated_at",
    "average_rating",
]);
const VALID_ROLES = new Set(["ADMIN", "USER", "STORE_OWNER"]);

function getText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function validateAdminUser(input = {}) {
    const result = validateRegistration(input);
    const role = typeof input.role === "string" ? input.role.trim().toUpperCase() : "";

    if (!ADMIN_CREATABLE_ROLES.has(role)) {
        result.errors.push("Role must be USER or ADMIN");
    }

    return {
        errors: result.errors,
        value: { ...result.value, role },
    };
}

function validateStoreOwner(input = {}) {
    return validateRegistration(input);
}

function validateStore(input = {}) {
    const name = getText(input.name);
    const email = getText(input.email).toLowerCase();
    const address = getText(input.address);
    const ownerId = Number(input.owner_id);
    const errors = [];

    if (name.length < 1 || name.length > 255) {
        errors.push("Store name must be between 1 and 255 characters");
    }

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("A valid store email address is required");
    }

    if (address.length < 1 || address.length > 400) {
        errors.push("Store address must be between 1 and 400 characters");
    }

    if (!Number.isSafeInteger(ownerId) || ownerId < 1) {
        errors.push("owner_id must be a positive integer");
    }

    return {
        errors,
        value: { name, email, address, ownerId },
    };
}

function getPositiveInteger(value, fallback, field, errors) {
    if (value === undefined) {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed < 1) {
        errors.push(`${field} must be a positive integer`);
        return fallback;
    }

    return parsed;
}

function validateListQuery(query = {}, allowedSortColumns, supportsRole) {
    const errors = [];
    const page = getPositiveInteger(query.page, 1, "page", errors);
    const requestedLimit = getPositiveInteger(query.limit, 10, "limit", errors);
    const limit = Math.min(requestedLimit, 100);
    const sortBy = getText(query.sortBy) || "created_at";
    const sortOrder = (getText(query.sortOrder) || "desc").toLowerCase();
    const role = getText(query.role).toUpperCase();

    if (!allowedSortColumns.has(sortBy)) {
        errors.push("sortBy is not supported");
    }

    if (sortOrder !== "asc" && sortOrder !== "desc") {
        errors.push("sortOrder must be asc or desc");
    }

    if (role && (!supportsRole || !VALID_ROLES.has(role))) {
        errors.push("role is not supported");
    }

    return {
        errors,
        value: {
            page,
            limit,
            offset: (page - 1) * limit,
            sortBy,
            sortOrder,
            name: getText(query.name),
            email: getText(query.email).toLowerCase(),
            address: getText(query.address),
            role,
        },
    };
}

function validateUserListQuery(query) {
    return validateListQuery(query, USER_SORT_COLUMNS, true);
}

function validateStoreListQuery(query) {
    return validateListQuery(query, STORE_SORT_COLUMNS, false);
}

function validateCreateStoreWithOwner(input = {}) {
    const name = getText(input.name);
    const email = getText(input.email).toLowerCase();
    const address = getText(input.address);

    const ownerName = getText(input.ownerName || input.owner_name);
    const ownerEmail = getText(input.ownerEmail || input.owner_email).toLowerCase();
    const ownerPassword = typeof (input.ownerPassword || input.owner_password) === "string" ? (input.ownerPassword || input.owner_password) : "";
    const ownerAddress = getText(input.ownerAddress || input.owner_address) || address;

    const errors = [];
    const fieldErrors = {};

    // Store validations
    if (!name) {
        const msg = "Store name is required.";
        errors.push(msg);
        fieldErrors.storeName = msg;
        fieldErrors.name = msg;
    } else if (name.length > 255) {
        const msg = "Store name must be between 1 and 255 characters.";
        errors.push(msg);
        fieldErrors.storeName = msg;
        fieldErrors.name = msg;
    }

    if (!email) {
        const msg = "Please enter a valid email address.";
        errors.push(msg);
        fieldErrors.storeEmail = msg;
        fieldErrors.email = msg;
    } else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const msg = "Please enter a valid email address.";
        errors.push(msg);
        fieldErrors.storeEmail = msg;
        fieldErrors.email = msg;
    }

    if (!address) {
        const msg = "Store address is required.";
        errors.push(msg);
        fieldErrors.storeAddress = msg;
        fieldErrors.address = msg;
    } else if (address.length > 400) {
        const msg = "Store address must be between 1 and 400 characters.";
        errors.push(msg);
        fieldErrors.storeAddress = msg;
        fieldErrors.address = msg;
    }

    // Store Owner validations
    if (!ownerName) {
        const msg = "Owner full name is required.";
        errors.push(msg);
        fieldErrors.ownerName = msg;
        fieldErrors.owner_name = msg;
    } else if (ownerName.length < 2 || ownerName.length > 60) {
        const msg = "Owner full name must be between 2 and 60 characters.";
        errors.push(msg);
        fieldErrors.ownerName = msg;
        fieldErrors.owner_name = msg;
    }

    if (!ownerEmail) {
        const msg = "Please enter a valid email address.";
        errors.push(msg);
        fieldErrors.ownerEmail = msg;
        fieldErrors.owner_email = msg;
    } else if (ownerEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) {
        const msg = "Please enter a valid email address.";
        errors.push(msg);
        fieldErrors.ownerEmail = msg;
        fieldErrors.owner_email = msg;
    }

    if (!ownerPassword) {
        const msg = "Password must be at least 8 characters.";
        errors.push(msg);
        fieldErrors.ownerPassword = msg;
        fieldErrors.owner_password = msg;
    } else if (ownerPassword.length < 8 || Buffer.byteLength(ownerPassword, "utf8") > 72) {
        const msg = "Password must be at least 8 characters.";
        errors.push(msg);
        fieldErrors.ownerPassword = msg;
        fieldErrors.owner_password = msg;
    }

    return {
        errors,
        fieldErrors,
        value: {
            name,
            email,
            address,
            ownerName,
            ownerEmail,
            ownerPassword,
            ownerAddress,
        },
    };
}

module.exports = {
    validateAdminUser,
    validateStoreOwner,
    validateStore,
    validateCreateStoreWithOwner,
    validateUserListQuery,
    validateStoreListQuery,
};
