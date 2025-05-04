import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <Button color="inherit" component={Link} to="/">
                        Planit
                    </Button>
                </Typography>
                {isAuthenticated ? (
                    <Box>
                        <Button color="inherit" component={Link} to="/trips/create">
                            Create Trip
                        </Button>
                        <Button color="inherit" component={Link} to="/join">
                            Join Trip
                        </Button>
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" component={Link} to="/login">
                            Login
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;