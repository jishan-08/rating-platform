/**
 * Owner Service
 * Business logic layer for Store Owner functionality.
 */

const ownerRepository = require("../repositories/ownerRepository");

async function getDashboard(ownerUserId) {
    const store = await ownerRepository.getOwnerStore(ownerUserId);

    if (!store) {
        return {
            hasStore: false,
            store: null,
            distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        };
    }

    const distribution = await ownerRepository.getOwnerRatingDistribution(store.id);

    return {
        hasStore: true,
        store,
        distribution,
    };
}

async function getMyStore(ownerUserId) {
    const store = await ownerRepository.getOwnerStore(ownerUserId);

    if (!store) {
        return {
            hasStore: false,
            store: null,
        };
    }

    return {
        hasStore: true,
        store,
    };
}

async function getRatings(ownerUserId) {
    const store = await ownerRepository.getOwnerStore(ownerUserId);

    if (!store) {
        return {
            hasStore: false,
            store: null,
            ratings: [],
        };
    }

    const ratings = await ownerRepository.getOwnerStoreRatings(store.id);

    return {
        hasStore: true,
        store: {
            id: store.id,
            name: store.name,
            averageRating: store.averageRating,
            totalRatings: store.totalRatings,
        },
        ratings,
    };
}

module.exports = {
    getDashboard,
    getMyStore,
    getRatings,
};
