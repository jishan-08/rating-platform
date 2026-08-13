const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getJwtExpiresIn, getJwtSecret } = require("../config/jwt");
const userRepository = require("../repositories/userRepository");

const BCRYPT_SALT_ROUNDS = 12;

async function registerUser({ name, email, address, password }) {
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    return userRepository.createUser({
        name,
        email,
        passwordHash,
        address,
        role: "USER",
    });
}

async function loginUser({ email, password }) {
    const user = await userRepository.findUserByEmailWithPassword(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null;
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
    registerUser,
    loginUser,
    getCurrentUser,
};
