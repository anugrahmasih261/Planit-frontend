import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    TextField, 
    Button, 
    Container, 
    Typography, 
    Box,
    Grid,
    InputAdornment,
    Alert,
    FormHelperText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tripService from '../api/trips';

const CreateTripPage = () => {
    const [name, setName] = useState('');
    const [tripCode, setTripCode] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [groupBudget, setGroupBudget] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const generateTripCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setTripCode(result);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
        setIsSubmitting(true);
        
        if (!name || !tripCode || !startDate || !endDate) {
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
                trip_code: tripCode,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
                group_budget: groupBudget || null
            };
            
            await tripService.createTrip(tripData, user.access);
            navigate('/');
        } catch (err) {
            console.error('Trip creation error:', err);
            if (err?.detail) {
                setError(err.detail);
            } else if (err?.errors) {
                setFieldErrors(err.errors);
                setError('Please fix the validation errors');
            } else {
                setError('Failed to create trip. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Create New Trip
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
                                error={!!fieldErrors.name}
                                helperText={fieldErrors.name?.[0] || ' '}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Trip Code"
                                value={tripCode}
                                onChange={(e) => setTripCode(e.target.value)}
                                error={!!fieldErrors.trip_code}
                                helperText={fieldErrors.trip_code?.[0] || ' '}
                                inputProps={{
                                    pattern: "[A-Za-z0-9-]+",
                                    title: "Only letters, numbers, and hyphens are allowed"
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <Button 
                                            onClick={generateTripCode}
                                            size="small"
                                        >
                                            Generate
                                        </Button>
                                    )
                                }}
                            />
                            <FormHelperText>
                                Create a unique code to share with friends (e.g., SUMMER-2023)
                            </FormHelperText>
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
                                            error: !!fieldErrors.start_date,
                                            helperText: fieldErrors.start_date?.[0] || ' '
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
                                            error: !!fieldErrors.end_date,
                                            helperText: fieldErrors.end_date?.[0] || ' '
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
                                error={!!fieldErrors.group_budget}
                                helperText={fieldErrors.group_budget?.[0] || ' '}
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
                                {isSubmitting ? 'Creating...' : 'Create Trip'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
};

export default CreateTripPage;