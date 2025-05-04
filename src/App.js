import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TripDetailPage from './pages/TripDetailPage';
import CreateTripPage from './pages/CreateTripPage';
import JoinTripPage from './pages/JoinTripPage';
import Navbar from './components/Navbar';
import { Container } from '@mui/material';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Navbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route
                            path="/"
                            element={
                                <PrivateRoute>
                                    <HomePage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/trips/create"
                            element={
                                <PrivateRoute>
                                    <CreateTripPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/trips/:id"
                            element={
                                <PrivateRoute>
                                    <TripDetailPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/join"
                            element={
                                <PrivateRoute>
                                    <JoinTripPage />
                                </PrivateRoute>
                            }
                        />
                    </Routes>
                </Container>
            </AuthProvider>
        </Router>
    );
}

export default App;