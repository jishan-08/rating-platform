/**
 * Store Controller
 * Handles incoming store catalog and rating info HTTP requests.
 */

const storeService = require("../services/storeService");
const { validateStoreListQuery, validateRatingInput } = require("../validators/storeValidator");

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

async function submitRating(req, res) {
    const { errors, value } = validateRatingInput({
        storeId: req.params.storeId,
        rating: req.body?.rating,
    });

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const userId = req.user.id;
        const ratingSummary = await storeService.rateStore(userId, value.storeId, value.rating);

        return res.status(200).json({
            success: true,
            message: "Rating saved successfully",
            data: ratingSummary,
        });
    } catch (error) {
        if (error.status === 404) {
            return res.status(404).json({
                success: false,
                message: error.message || "Store not found",
            });
        }

        console.error("Store rating submission failed:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit rating",
        });
    }
}

module.exports = {
    listStores,
    submitRating,
};
