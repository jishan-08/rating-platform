/**
 * Store Service
 * Business logic layer for store operations.
 */

const storeRepository = require("../repositories/storeRepository");

async function getStores(userId, filters) {
    return storeRepository.listStoresWithRatings(userId, filters);
}

async function rateStore(userId, storeId, rating) {
    const store = await storeRepository.findStoreById(storeId);
    if (!store) {
        const error = new Error("Store not found");
        error.status = 404;
        throw error;
    }

    await storeRepository.upsertRating(userId, storeId, rating);
    return storeRepository.getStoreRatingSummary(userId, storeId);
}

module.exports = {
    getStores,
    rateStore,
};
