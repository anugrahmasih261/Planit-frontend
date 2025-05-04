import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/auth';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    
    useEffect(() => {
        const initializeAuth = async () => {
            const userData = JSON.parse(localStorage.getItem('user'));
            
            if (userData?.access) {
                try {
                    const profile = await authService.getProfile(userData.access);
                    setUser({ ...userData, ...profile });
                    setIsAuthenticated(true);
                } catch (error) {
                    logout();
                }
            }
            setIsLoading(false);
        };
        
        initializeAuth();
    }, []);
    
    const login = async (credentials) => {
        try {
            const userData = await authService.login(credentials);
            setUser(userData);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };
    
    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            console.error('Registration failed:', error.response?.data);
            throw error; // Let the component handle the error
        }
    };
    
    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    };
    
    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);