/**
 * Store Service
 * Business logic layer for store operations.
 */

const storeRepository = require("../repositories/storeRepository");

async function getStores(userId, filters) {
    return storeRepository.listStoresWithRatings(userId, filters);
}

module.exports = {
    getStores,
};
