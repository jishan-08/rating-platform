const adminService = require("../services/adminService");
const {
    validateAdminUser,
    validateStoreOwner,
    validateStore,
    validateCreateStoreWithOwner,
    validateUserListQuery,
    validateStoreListQuery,
} = require("../validators/adminValidator");

function sendValidationError(res, errors, fieldErrors = {}) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
        fieldErrors,
    });
}

function sendPagination(res, data, total, page, limit, key) {
    return res.status(200).json({
        success: true,
        [key]: data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    });
}

async function dashboard(req, res) {
    try {
        const statistics = await adminService.getDashboard();
        return res.status(200).json({
            success: true,
            data: statistics,
            statistics,
        });
    } catch (error) {
        console.error("Admin dashboard query failed:", error);
        return res.status(500).json({ success: false, message: "Unable to retrieve dashboard statistics" });
    }
}

async function createUser(req, res) {
    const { errors, value } = validateAdminUser(req.body);
    if (errors.length) return sendValidationError(res, errors);

    try {
        const user = await adminService.createManagedUser(value);
        return res.status(201).json({ success: true, message: "User created successfully", user });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Email is already registered" });
        }
        console.error("Admin user creation failed");
        return res.status(500).json({ success: false, message: "Unable to create user" });
    }
}

async function createStoreOwner(req, res) {
    const { errors, value } = validateStoreOwner(req.body);
    if (errors.length) return sendValidationError(res, errors);

    try {
        const user = await adminService.createStoreOwner(value);
        return res.status(201).json({ success: true, message: "Store owner created successfully", user });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ success: false, message: "Email is already registered" });
        }
        console.error("Store owner creation failed");
        return res.status(500).json({ success: false, message: "Unable to create store owner" });
    }
}

async function createStore(req, res) {
    // If request includes owner credentials (the standard single-form store + owner creation workflow)
    if (req.body.ownerName || req.body.owner_name || req.body.ownerEmail || req.body.owner_email || req.body.ownerPassword || req.body.owner_password) {
        const { errors, fieldErrors, value } = validateCreateStoreWithOwner(req.body);
        if (errors.length) return sendValidationError(res, errors, fieldErrors);

        try {
            const store = await adminService.createStoreWithOwner(value);
            return res.status(201).json({
                success: true,
                message: "Store created successfully. Store owner account has been created and linked to the store.",
                store,
            });
        } catch (error) {
            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message: error.message || "An account with this email is already registered",
                    fieldErrors: {
                        ownerEmail: "An account with this email is already registered",
                    },
                });
            }
            console.error("Store with owner creation failed:", error);
            return res.status(500).json({ success: false, message: "Unable to create store and owner account" });
        }
    }

    // Fallback: create store with existing owner_id
    const { errors, value } = validateStore(req.body);
    if (errors.length) return sendValidationError(res, errors);

    try {
        const store = await adminService.createStore(value);
        return res.status(201).json({ success: true, message: "Store created successfully", store });
    } catch (error) {
        if (error.code === "STORE_OWNER_NOT_FOUND") {
            return res.status(404).json({ success: false, message: "Store owner was not found" });
        }
        if (error.code === "INVALID_STORE_OWNER") {
            return res.status(400).json({ success: false, message: "owner_id must belong to a STORE_OWNER" });
        }
        console.error("Store creation failed:", error);
        return res.status(500).json({ success: false, message: "Unable to create store" });
    }
}

async function listUsers(req, res) {
    const { errors, value } = validateUserListQuery(req.query);
    if (errors.length) return sendValidationError(res, errors);

    try {
        const { users, total } = await adminService.getUsers(value);
        return sendPagination(res, users, total, value.page, value.limit, "users");
    } catch (error) {
        console.error("Admin user list query failed");
        return res.status(500).json({ success: false, message: "Unable to retrieve users" });
    }
}

async function listStores(req, res) {
    const { errors, value } = validateStoreListQuery(req.query);
    if (errors.length) return sendValidationError(res, errors);

    try {
        const { stores, total } = await adminService.getStores(value);
        return sendPagination(res, stores, total, value.page, value.limit, "stores");
    } catch (error) {
        console.error("Admin store list query failed");
        return res.status(500).json({ success: false, message: "Unable to retrieve stores" });
    }
}

module.exports = {
    dashboard,
    createUser,
    createStoreOwner,
    createStore,
    listUsers,
    listStores,
};
