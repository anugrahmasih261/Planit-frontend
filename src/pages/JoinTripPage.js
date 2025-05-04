import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    Card, 
    CardContent,
    TextField,
    Alert
} from '@mui/material';
import tripService from '../api/trips';

const JoinTripPage = () => {
    const [tripCode, setTripCode] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleJoin = async () => {
        if (!tripCode) {
            setError('Trip code is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await tripService.joinTrip(tripCode, user.access);
            navigate('/');
        } catch (err) {
            console.error('Failed to join trip:', err);
            setError(err.detail || 'Failed to join trip. Please check the code and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Join a Trip
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Enter Trip Code
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 3 }}>
                            Ask the trip organizer for the trip code and enter it below to join.
                        </Typography>
                        <TextField
                            fullWidth
                            label="Trip Code"
                            value={tripCode}
                            onChange={(e) => setTripCode(e.target.value.toUpperCase())}
                            sx={{ mb: 3 }}
                            inputProps={{
                                style: { textTransform: 'uppercase' }
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleJoin}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Joining...' : 'Join Trip'}
                        </Button>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default JoinTripPage;