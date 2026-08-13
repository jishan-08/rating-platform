/**
 * Store Query Validator
 * Validates search, filter, sorting, and pagination parameters for store browsing.
 */

const ALLOWED_STORE_SORT_COLUMNS = new Set([
    "name",
    "address",
    "average_rating",
    "total_ratings",
    "created_at",
]);

function getText(value) {
    return typeof value === "string" ? value.trim() : "";
}

function getPositiveInteger(value, fallback, field, errors) {
    if (value === undefined || value === "") {
        return fallback;
    }

    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed < 1) {
        errors.push(`${field} must be a positive integer`);
        return fallback;
    }

    return parsed;
}

function validateStoreListQuery(query = {}) {
    const errors = [];

    const page = getPositiveInteger(query.page, 1, "page", errors);
    const requestedLimit = getPositiveInteger(query.limit, 10, "limit", errors);
    const limit = Math.min(requestedLimit, 100);

    const rawSortBy = getText(query.sortBy).toLowerCase();
    const sortBy = rawSortBy || "name";

    const rawSortOrder = getText(query.sortOrder).toLowerCase();
    const sortOrder = rawSortOrder || "asc";

    if (!ALLOWED_STORE_SORT_COLUMNS.has(sortBy)) {
        errors.push(`sortBy '${sortBy}' is not supported. Allowed: ${Array.from(ALLOWED_STORE_SORT_COLUMNS).join(", ")}`);
    }

    if (sortOrder !== "asc" && sortOrder !== "desc") {
        errors.push("sortOrder must be 'asc' or 'desc'");
    }

    // Support both 'search' and 'name' query parameter aliases
    const search = getText(query.search) || getText(query.name);
    const address = getText(query.address);

    return {
        errors,
        value: {
            search,
            address,
            page,
            limit,
            offset: (page - 1) * limit,
            sortBy,
            sortOrder,
        },
    };
}

module.exports = {
    validateStoreListQuery,
};
