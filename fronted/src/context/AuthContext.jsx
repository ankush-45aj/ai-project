import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem('user');
        setCurrentUser(user ? JSON.parse(user) : null);
        setLoading(false);
    }, []);

    // ✅ Updated login to accept full user object
    const login = (userData) => {
        localStorage.setItem('user', JSON.stringify(userData));
        setCurrentUser(userData);
    };

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

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
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

export function useAuth() {
    return useContext(AuthContext);
}

export default AuthContext;
