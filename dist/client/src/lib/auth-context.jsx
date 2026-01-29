import { createContext, useContext, useState, useEffect } from 'react';
var AuthContext = createContext(undefined);
export function AuthProvider(_a) {
    var children = _a.children;
    var _b = useState(false), isAuthenticated = _b[0], setIsAuthenticated = _b[1];
    // Check if user is already authenticated on mount
    useEffect(function () {
        var stored = localStorage.getItem('adminAuthenticated');
        if (stored === 'true') {
            setIsAuthenticated(true);
        }
    }, []);
    var login = function (username, password) {
        var adminUsername = import.meta.env.VITE_ADMIN_USERNAME;
        var adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
        console.log('Login attempt:', { username: username, enteredPassword: password.length + ' chars' });
        console.log('Expected credentials:', { adminUsername: adminUsername, adminPassword: adminPassword ? 'set' : 'not set' });
        if (username === adminUsername && password === adminPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('adminAuthenticated', 'true');
            console.log('Login successful');
            return true;
        }
        console.log('Login failed - credentials do not match');
        return false;
    };
    var logout = function () {
        setIsAuthenticated(false);
        localStorage.removeItem('adminAuthenticated');
    };
    return (<AuthContext.Provider value={{ isAuthenticated: isAuthenticated, login: login, logout: logout }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    var context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
