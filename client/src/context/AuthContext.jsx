import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem('lt_token'));
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('lt_user') || 'null'));

    const login = (token, user) => {
        localStorage.setItem('lt_token', token);
        localStorage.setItem('lt_user', JSON.stringify(user));
        setToken(token);
        setUser(user);
    };

    const logout = () => {
        localStorage.removeItem('lt_token');
        localStorage.removeItem('lt_user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);