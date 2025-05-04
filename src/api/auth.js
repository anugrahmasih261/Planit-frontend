import axios from 'axios';

// const API_URL = 'http://localhost:8000/api/auth';
const API_URL = 'https://planit-backend-2f8w.onrender.com/api/auth';


const register = async (userData) => {
    try {
        // Transform data to match backend expectations
        const registrationData = {
            email: userData.email,
            username: userData.username,
            password: userData.password,
            confirmPassword: userData.confirmPassword
        };

        const response = await axios.post(`${API_URL}/register/`, registrationData, {
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        return response.data;
    } catch (error) {
        console.error('Registration error:', error.response?.data);
        throw error; // Rethrow to handle in the component
    }
};

const login = async (userData) => {
    const response = await axios.post(`${API_URL}/login/`, userData);
    
    if (response.data) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getProfile = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    
    const response = await axios.get(`${API_URL}/profile/`, config);
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getProfile,
};

export default authService;