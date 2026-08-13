function getJwtSecret() {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not configured");
    }

    return secret;
}

function getJwtExpiresIn() {
    return process.env.JWT_EXPIRES_IN || "1d";
}

module.exports = {
    getJwtSecret,
    getJwtExpiresIn,
};
