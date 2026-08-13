const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config/jwt");

function authenticate(req, res, next) {
    const authorization = req.get("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    const token = authorization.slice("Bearer ".length).trim();

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }

    try {
        const payload = jwt.verify(token, getJwtSecret());

        if (!payload.sub || !payload.role) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        req.user = {
            id: Number(payload.sub),
            role: payload.role,
        };

        return next();
    } catch (error) {
        if (error.message === "JWT_SECRET is not configured") {
            return res.status(500).json({
                success: false,
                message: "Authentication is not configured",
            });
        }

        return res.status(401).json({
            success: false,
            message: "Authentication required",
        });
    }
}

module.exports = authenticate;
