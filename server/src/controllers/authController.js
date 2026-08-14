const authService = require("../services/authService");
const { validateLogin, validateRegistration } = require("../validators/authValidator");

function sendValidationError(res, errors) {
    return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
    });
}

async function register(req, res) {
    const { errors, value } = validateRegistration(req.body);

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const user = await authService.registerUser(value);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email is already registered",
            });
        }

        console.error("User registration failed");

        return res.status(500).json({
            success: false,
            message: "Unable to register user",
        });
    }
}

async function login(req, res) {
    const { errors, value } = validateLogin(req.body);

    if (errors.length > 0) {
        return sendValidationError(res, errors);
    }

    try {
        const result = await authService.loginUser(value);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            ...result,
        });
    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            return res.status(error.status).json({
                success: false,
                message: error.message,
            });
        }

        console.error("User login failed:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to log in",
        });
    }
}

async function me(req, res) {
    try {
        const user = await authService.getCurrentUser(req.user.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Current user lookup failed");

        return res.status(500).json({
            success: false,
            message: "Unable to retrieve user",
        });
    }
}

module.exports = {
    register,
    login,
    me,
};
