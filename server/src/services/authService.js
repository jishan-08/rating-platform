const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getJwtExpiresIn, getJwtSecret } = require("../config/jwt");
const userRepository = require("../repositories/userRepository");

const BCRYPT_SALT_ROUNDS = 12;

async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

async function registerUser({ name, email, address, password }) {
    const passwordHash = await hashPassword(password);

    return userRepository.createUser({
        name,
        email,
        passwordHash,
        address,
        role: "USER",
    });
}

async function loginUser({ email, password, portal }) {
    const user = await userRepository.findUserByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        const error = new Error("Invalid email or password");
        error.status = 401;
        throw error;
    }

    // Role-based portal enforcement
    if (portal === "admin") {
        if (user.role !== "ADMIN") {
            const error = new Error("Only administrators can access the Admin Portal.");
            error.status = 403;
            throw error;
        }
    } else {
        // Standard login: only CUSTOMER (USER) and STORE_OWNER are permitted
        if (user.role === "ADMIN") {
            const error = new Error("Administrators must use the Admin Portal to sign in.");
            error.status = 403;
            throw error;
        }
    }

    const token = jwt.sign(
        { sub: user.id, role: user.role },
        getJwtSecret(),
        { expiresIn: getJwtExpiresIn() }
    );

    const { password_hash: passwordHash, ...safeUser } = user;

    return { token, user: safeUser };
}

async function getCurrentUser(id) {
    return userRepository.findUserById(id);
}

module.exports = {
    hashPassword,
    registerUser,
    loginUser,
    getCurrentUser,
};
