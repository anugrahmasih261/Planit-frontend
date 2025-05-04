import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box,
    Alert
} from '@mui/material';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const { register } = useAuth();
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        
        // Client-side validation
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        try {
            const response = await register({ 
                email, 
                username, 
                password, 
                confirmPassword 
            });
            
            if (response.detail === "User created successfully") {
                navigate('/login');
            }
        } catch (error) {
            if (error.response?.data?.errors) {
                setFieldErrors(error.response.data.errors);
            } else {
                setError('Registration failed. Please try again.');
            }
        }
    };
    
    return (
        <Container maxWidth="xs">
            <Box sx={{ 
                mt: 8, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' 
            }}>
                <Typography component="h1" variant="h5">
                    Sign up
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}
                
                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ mt: 1, width: '100%' }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Email Address"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!fieldErrors.email}
                        helperText={fieldErrors.email?.[0] || ''}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={!!fieldErrors.username}
                        helperText={fieldErrors.username?.[0] || ''}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!fieldErrors.password}
                        helperText={fieldErrors.password?.[0] || ''}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        error={!!fieldErrors.confirmPassword}
                        helperText={fieldErrors.confirmPassword?.[0] || ''}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default RegisterPage;