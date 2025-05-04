import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Container, 
    Typography, 
    Box, 
    Button, 
    Card, 
    CardContent,
    TextField,
    Divider,
    Chip,
    Alert
} from '@mui/material';
import { Email, ContentCopy } from '@mui/icons-material';
import tripService from '../api/trips';

const InvitePage = () => {
    const { tripId } = useParams();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tripCode, setTripCode] = useState('');

    const fetchTripCode = async () => {
        try {
            const trip = await tripService.getTrip(tripId, user.access);
            setTripCode(trip.trip_code);
        } catch (err) {
            console.error('Failed to fetch trip:', err);
        }
    };

    useState(() => {
        fetchTripCode();
    }, [tripId, user.access]);

    const handleInvite = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }

        try {
            await tripService.inviteUser(tripId, email, user.access);
            setSuccess('Invitation sent successfully!');
            setEmail('');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to invite user:', err);
            setError(err.detail || 'Failed to send invitation');
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(tripCode);
        setSuccess('Trip code copied to clipboard!');
        setTimeout(() => setSuccess(''), 3000);
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Invite Friends
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Invite via Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    sx={{ mb: 2 }}
                                    InputProps={{
                                        startAdornment: <Email sx={{ mr: 1 }} />,
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleInvite}
                                    fullWidth
                                >
                                    Send Invitation
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Invite via Trip Code
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>
                                    Share this code with friends to let them join your trip:
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Chip 
                                        label={tripCode} 
                                        sx={{ 
                                            fontSize: '1.2rem',
                                            padding: '10px',
                                            mr: 2
                                        }} 
                                    />
                                    <Button
                                        variant="outlined"
                                        startIcon={<ContentCopy />}
                                        onClick={copyToClipboard}
                                    >
                                        Copy
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default InvitePage;