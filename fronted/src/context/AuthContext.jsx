import { createContext, useContext, useState, useEffect } from 'react';

// Create and export the context
export const AuthContext = createContext();

// Auth Provider Component
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Mock authentication - replace with real API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            const user = localStorage.getItem('user');
            setCurrentUser(user ? JSON.parse(user) : null);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Login function
    // Important: Make sure login properly sets the user
    const login = async (email, password) => {
        try {
            // Replace this with your actual authentication logic
            const userData = { email, name: email.split('@')[0] };
            localStorage.setItem('user', JSON.stringify(userData)); // Persist user
            setCurrentUser(userData); // Update state
            return true; // Return success status
        } catch (error) {
            throw error;
        }
    };

    // Register function
    const register = async (email, password, name) => {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        setCurrentUser(data.user);
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('user');
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Custom hook for easy access
export function useAuth() {
    return useContext(AuthContext);
}

// Default export
export default AuthContext;