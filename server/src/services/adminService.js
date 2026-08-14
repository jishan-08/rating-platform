const authService = require("./authService");
const userRepository = require("../repositories/userRepository");
const adminRepository = require("../repositories/adminRepository");

async function createManagedUser({ name, email, address, password, role }) {
    const passwordHash = await authService.hashPassword(password);

    return userRepository.createUser({
        name,
        email,
        address,
        passwordHash,
        role,
    });
}

async function createStoreOwner(user) {
    return createManagedUser({ ...user, role: "STORE_OWNER" });
}

async function createStore(store) {
    const owner = await userRepository.findUserById(store.ownerId);

    if (!owner) {
        const error = new Error("Store owner was not found");
        error.code = "STORE_OWNER_NOT_FOUND";
        throw error;
    }

    if (owner.role !== "STORE_OWNER") {
        const error = new Error("Selected user is not a store owner");
        error.code = "INVALID_STORE_OWNER";
        throw error;
    }

    return adminRepository.createStore(store);
}

async function createStoreWithOwner(data) {
    const existing = await userRepository.findUserByEmail(data.ownerEmail);
    if (existing) {
        const error = new Error("An account with this store owner email is already registered");
        error.code = "ER_DUP_ENTRY";
        throw error;
    }

    const passwordHash = await authService.hashPassword(data.ownerPassword);

    return adminRepository.createStoreWithOwner({
        ...data,
        passwordHash,
    });
}

async function getDashboard() {
    return adminRepository.getDashboardStatistics();
}

async function getUsers(filters) {
    return adminRepository.listUsers(filters);
}

async function getStores(filters) {
    return adminRepository.listStores(filters);
}

module.exports = {
    createManagedUser,
    createStoreOwner,
    createStore,
    createStoreWithOwner,
    getDashboard,
    getUsers,
    getStores,
};
