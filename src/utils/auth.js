// Authentication utilities for admin panel

const AUTH_KEY = 'tary_admin_auth';
const ADMIN_PASSWORD = 'Tary@Praia2024#Secure'; // New secure password

// Simple hash function for password (client-side only - for production use bcrypt on server)
const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const session = sessionStorage.getItem(AUTH_KEY);
    if (!session) return false;

    try {
        const { expiresAt } = JSON.parse(session);
        return Date.now() < expiresAt;
    } catch {
        return false;
    }
};

// Login with password
export const login = (password) => {
    if (password === ADMIN_PASSWORD) {
        // Session expires in 2 hours
        const session = {
            loggedInAt: Date.now(),
            expiresAt: Date.now() + (2 * 60 * 60 * 1000),
            hash: simpleHash(password)
        };
        sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
        return true;
    }
    return false;
};

// Logout
export const logout = () => {
    sessionStorage.removeItem(AUTH_KEY);
};

// Get session info
export const getSession = () => {
    const session = sessionStorage.getItem(AUTH_KEY);
    if (!session) return null;

    try {
        return JSON.parse(session);
    } catch {
        return null;
    }
};
