/**
 * User Controller
 * Handles user-specific requests including fetching user ratings.
 */

const userService = require("../services/userService");

async function getMyRatings(req, res) {
    try {
        const userId = req.user.id;
        const ratings = await userService.getUserRatings(userId);

        return res.status(200).json({
            success: true,
            ratings,
        });
    } catch (error) {
        console.error("Failed to fetch user ratings:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve ratings",
        });
    }
}

module.exports = {
    getMyRatings,
};
