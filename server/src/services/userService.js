/**
 * User Service
 * Business logic layer for user profile and ratings operations.
 */

const userRepository = require("../repositories/userRepository");

async function getUserRatings(userId) {
    return userRepository.findRatingsByUserId(userId);
}

module.exports = {
    getUserRatings,
};
