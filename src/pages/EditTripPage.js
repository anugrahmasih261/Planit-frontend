import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box,
    Grid,
    InputAdornment,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tripService from '../api/trips';

const EditTripPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [groupBudget, setGroupBudget] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchTrip = async () => {
            try {
                const trip = await tripService.getTrip(id, user.access);
                setName(trip.name);
                setStartDate(new Date(trip.start_date));
                setEndDate(new Date(trip.end_date));
                setGroupBudget(trip.group_budget || '');
            } catch (err) {
                console.error('Failed to fetch trip:', err);
                setError('Failed to load trip details');
            }
        };

        fetchTrip();
    }, [id, user.access]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        
        if (!name || !startDate || !endDate) {
            setError('Please fill in all required fields');
            setIsSubmitting(false);
            return;
        }
        
        if (startDate > endDate) {
            setError('End date must be after start date');
            setIsSubmitting(false);
            return;
        }

        try {
            const tripData = {
                name,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                group_budget: groupBudget || null
            };
            
            await tripService.updateTrip(id, tripData, user.access);
            navigate(`/trips/${id}`);
        } catch (err) {
            console.error('Failed to update trip:', err);
            setError(err.detail || 'Failed to update trip. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Edit Trip
                </Typography>
                
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}
                
                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Trip Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                                <DatePicker
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    minDate={startDate}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            required: true,
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Group Budget (optional)"
                                type="number"
                                value={groupBudget}
                                onChange={(e) => setGroupBudget(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">$</InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default EditTripPage;