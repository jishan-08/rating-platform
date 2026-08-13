/**
 * Store Controller
 * Handles incoming store catalog and rating info HTTP requests.
 */

const storeService = require("../services/storeService");
const { validateStoreListQuery } = require("../validators/storeValidator");

function sendValidationError(res, errors) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
    });
}

async function listStores(req, res) {
    const { errors, value } = validateStoreListQuery(req.query);

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const userId = req.user.id;
        const { stores, total } = await storeService.getStores(userId, value);

        return res.status(200).json({
            success: true,
            stores,
            pagination: {
                page: value.page,
                limit: value.limit,
                total,
                totalPages: Math.ceil(total / value.limit) || 1,
            },
        });
    } catch (error) {
        console.error("Store list query failed:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve stores",
        });
    }
}

module.exports = {
    listStores,
};
