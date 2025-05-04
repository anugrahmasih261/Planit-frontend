import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import tripService from '../api/trips';
import { useAuth } from '../contexts/AuthContext';
import { 
    Button, 
    Card, 
    CardContent, 
    Container, 
    Grid, 
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { Add } from '@mui/icons-material';

const HomePage = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setLoading(true);
                const data = await tripService.getTrips(user.access);
                setTrips(data);
            } catch (error) {
                console.error('Failed to fetch trips:', error);
                setError('Failed to load trips. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchTrips();
    }, [user.access]);
    
    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container>
            <Typography variant="h4" component="h1" gutterBottom>
                My Trips
            </Typography>
            <Button
                variant="contained"
                startIcon={<Add />}
                component={Link}
                to="/trips/create"
                sx={{ mb: 3 }}
            >
                Create New Trip
            </Button>
            <Grid container spacing={3}>
                {trips.length > 0 ? (
                    trips.map((trip) => (
                        <Grid item xs={12} sm={6} md={4} key={trip.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h5" component="h2">
                                        {trip.name}
                                    </Typography>
                                    <Typography color="textSecondary" sx={{ mb: 1.5 }}>
                                        {new Date(trip.start_date).toLocaleDateString()} -{' '}
                                        {new Date(trip.end_date).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" component="p">
                                        {trip.participants?.length || 0} participants
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to={`/trips/${trip.id}`}
                                        size="small"
                                        sx={{ mt: 2 }}
                                    >
                                        View Details
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                ) : (
                    <Grid item xs={12}>
                        <Typography variant="body1">
                            No trips found. Create your first trip!
                        </Typography>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default HomePage;

// const [success, setSuccess] = useState('');
