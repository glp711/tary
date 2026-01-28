// Authentication utilities for admin panel
import { getAuth, signInAnonymously, signOut } from "firebase/auth";
import app from "./firebase";

const auth = getAuth(app);
const AUTH_KEY = 'tary_admin_auth';
const ADMIN_PASSWORD = 'Tary@Praia2024#Secure'; // Still keeping simple password protection for the UI

// Check if user is authenticated
export const isAuthenticated = () => {
    // Check both session storage (for UI speed) and Firebase auth object
    const session = sessionStorage.getItem(AUTH_KEY);
    return !!session;
};

// Login with password
export const login = async (password) => {
    if (password === ADMIN_PASSWORD) {
        try {
            // Sign in to Firebase Anonymously to get a valid token for Storage Rules
            await signInAnonymously(auth);

            // Set local session
            const session = {
                loggedInAt: Date.now(),
                expiresAt: Date.now() + (2 * 60 * 60 * 1000)
            };
            sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
            return true;
        } catch (error) {
            console.error("Firebase Auth Error:", error);
            // Even if Firebase fails, we might want to let them in locally, 
            // BUT storage won't work. So better to fail or warn.
            alert("Erro de conexão com Firebase. O upload de imagens pode não funcionar.");
            return true; // Allowing UI access but storage will fail if auth failed
        }
    }
    return false;
};

// Logout
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout error:", error);
    }
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

// Ensure auth persistence
auth.onAuthStateChanged((user) => {
    if (!user && isAuthenticated()) {
        // If local session exists but firebase user is gone (refresh), re-sign in
        signInAnonymously(auth).catch(console.error);
    }
});
