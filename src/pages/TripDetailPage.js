import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    Divider,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Menu,
    MenuItem,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Alert,
    CircularProgress,
    InputAdornment
} from '@mui/material';
import {
    Add,
    MoreVert,
    PersonAdd,
    Share,
    Edit,
    Delete
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import tripService from '../api/trips';
import { useAuth } from '../contexts/AuthContext';
import ActivityItem from '../components/ActivityItem';

ChartJS.register(ArcElement, Tooltip, Legend);

const TripDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // State management
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [editActivityId, setEditActivityId] = useState(null);

    // Activity form state
    const [activityForm, setActivityForm] = useState({
        title: '',
        date: null,
        time: '',
        category: 'OT',
        estimated_cost: '',
        notes: ''
    });

    // Fetch trip data with error handling
    const fetchTrip = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await tripService.getTrip(id, user.access);
            setTrip(data);
        } catch (err) {
            console.error('Failed to fetch trip:', err);
            setError(err.detail || 'Failed to load trip details');
        } finally {
            setLoading(false);
        }
    }, [id, user.access]);

    useEffect(() => {
        fetchTrip();
    }, [fetchTrip]);

    // Menu handlers
    const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // Trip actions
    const handleDeleteTrip = async () => {
        if (window.confirm('Are you sure you want to delete this trip?')) {
            try {
                await tripService.deleteTrip(id, user.access);
                navigate('/');
            } catch (err) {
                console.error('Failed to delete trip:', err);
                setError(err.detail || 'Failed to delete trip');
            }
        }
    };

    // Participant actions
    const handleInviteUser = async () => {
        if (!email) {
            setError('Please enter an email address');
            return;
        }

        try {
            await tripService.inviteUser(id, email, user.access);
            setEmail('');
            setInviteDialogOpen(false);
            setSuccess('Invitation sent successfully!');
            setTimeout(() => setSuccess(''), 3000);
            await fetchTrip();
        } catch (err) {
            console.error('Failed to invite user:', err);
            setError(err.detail || 'Failed to invite user');
        }
    };

    const handleActivitySubmit = async () => {
        if (!activityForm.title || !activityForm.date) {
            setError('Title and date are required');
            return;
        }

        try {
            const activityData = {
                title: activityForm.title,
                date: activityForm.date.toISOString().split('T')[0],
                time: activityForm.time || null,
                category: activityForm.category,
                estimated_cost: activityForm.estimated_cost ? parseFloat(activityForm.estimated_cost) : null,
                notes: activityForm.notes || null,
                trip: id
            };

            if (editActivityId) {
                await tripService.updateActivity(id, editActivityId, activityData, user.access);
                setSuccess('Activity updated successfully!');
            } else {
                await tripService.createActivity(id, activityData, user.access);
                setSuccess('Activity created successfully!');
            }

            setActivityDialogOpen(false);
            resetActivityForm();
            setTimeout(() => setSuccess(''), 3000);
            await fetchTrip();
        } catch (err) {
            console.error('Failed to save activity:', err);
            setError(err.detail || err.message || 'Failed to save activity');
        }
    };

    const resetActivityForm = () => {
        setActivityForm({
            title: '',
            date: null,
            time: '',
            category: 'OT',
            estimated_cost: '',
            notes: ''
        });
        setEditActivityId(null);
    };

    const handleEditActivity = (activity) => {
        setActivityForm({
            title: activity.title,
            date: new Date(activity.date),
            time: activity.time || '',
            category: activity.category,
            estimated_cost: activity.estimated_cost || '',
            notes: activity.notes || ''
        });
        setEditActivityId(activity.id);
        setActivityDialogOpen(true);
    };

    const handleDeleteActivity = async (activityId) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            try {
                await tripService.deleteActivity(id, activityId, user.access);
                setSuccess('Activity deleted successfully!');
                setTimeout(() => setSuccess(''), 3000);
                await fetchTrip();
            } catch (err) {
                console.error('Failed to delete activity:', err);
                setError('Failed to delete activity');
            }
        }
    };

    const handleVote = async (activityId, vote) => {
        try {
            await tripService.voteActivity(id, activityId, vote, user.access);
            await fetchTrip();
        } catch (err) {
            console.error('Failed to vote:', err);
            setError('Failed to record vote');
        }
    };

    const handleCopyTripCode = () => {
        if (trip?.trip_code) {
            navigator.clipboard.writeText(trip.trip_code);
            setSuccess('Trip code copied to clipboard!');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError('No trip code available');
        }
    };

    const getParticipantInitial = (participant) => {
        const displayName = participant?.user?.username || participant?.user?.email || '?';
        return displayName.charAt(0).toUpperCase();
    };

    const getParticipantName = (participant) => {
        return participant?.user?.username || participant?.user?.email || 'Unknown participant';
    };

    const isOrganizer = (participant) => {
        return participant?.user?.id === trip?.created_by?.id;
    };

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!trip) {
        return (
            <Container>
                <Alert severity="error">{error || 'Trip not found'}</Alert>
            </Container>
        );
    }

    // Prepare data for budget chart
    const budgetData = {
        labels: trip.activities?.map(activity => activity?.title).filter(Boolean) || [],
        datasets: [
            {
                data: trip.activities?.map(activity => activity?.estimated_cost || 0) || [],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40'
                ],
            }
        ]
    };

    // Group activities by date
    const activitiesByDate = {};
    trip.activities?.forEach(activity => {
        if (!activity?.date) return;
        const date = activity.date;
        if (!activitiesByDate[date]) {
            activitiesByDate[date] = [];
        }
        activitiesByDate[date].push(activity);
    });

    return (
        <Container maxWidth="lg">
            {/* Success and error messages */}
            {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Trip Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    {trip.name || 'Untitled Trip'}
                </Typography>

                {trip.created_by?.id === user.id && (
                    <Box>
                        <IconButton onClick={handleMenuOpen}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            <MenuItem onClick={() => { navigate(`/trips/${id}/edit`); handleMenuClose(); }}>
                                <Edit sx={{ mr: 1 }} /> Edit Trip
                            </MenuItem>
                            <MenuItem onClick={() => { handleDeleteTrip(); handleMenuClose(); }}>
                                <Delete sx={{ mr: 1 }} /> Delete Trip
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Box>

            {/* Trip Info */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Trip Details
                            </Typography>
                            <Typography>
                                <strong>Dates:</strong> {trip.start_date ? new Date(trip.start_date).toLocaleDateString() : 'N/A'} - {trip.end_date ? new Date(trip.end_date).toLocaleDateString() : 'N/A'}
                            </Typography>
                            {trip.group_budget && (
                                <Typography>
                                    <strong>Group Budget:</strong> ${trip.group_budget}
                                </Typography>
                            )}
                            <Typography>
                                <strong>Created by:</strong> {trip.created_by?.username || trip.created_by?.email || 'Unknown'}
                            </Typography>

                            <Box sx={{ mt: 2 }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<PersonAdd />}
                                    onClick={() => setInviteDialogOpen(true)}
                                    sx={{ mr: 2 }}
                                >
                                    Invite
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<Share />}
                                    onClick={handleCopyTripCode}
                                >
                                    Copy Trip Code
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Participants ({trip.participants?.length || 0})
                            </Typography>
                            <List>
                                {trip.participants?.map(participant => (
                                    <ListItem key={participant?.user?.id || participant?.id}>
                                        <Avatar sx={{ mr: 2 }}>
                                            {getParticipantInitial(participant)}
                                        </Avatar>
                                        <ListItemText
                                            primary={getParticipantName(participant)}
                                            secondary={isOrganizer(participant) ? "Organizer" : ""}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Budget Visualization */}
            {trip.activities?.some(a => a?.estimated_cost) && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        Budget Breakdown
                    </Typography>
                    <Box sx={{ height: '300px' }}>
                        <Pie data={budgetData} />
                    </Box>
                </Box>
            )}

            {/* Activities Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5">
                        Activities
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => {
                            resetActivityForm();
                            setActivityDialogOpen(true);
                        }}
                    >
                        Add Activity
                    </Button>
                </Box>

                {Object.keys(activitiesByDate).length > 0 ? (
                    Object.entries(activitiesByDate).map(([date, activities]) => (
                        <Box key={date} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                {date ? new Date(date).toLocaleDateString() : 'No date'}
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                {activities.map(activity => (
                                    <Grid item xs={12} sm={6} md={4} key={activity?.id}>
                                        <ActivityItem
                                            activity={activity}
                                            onVote={handleVote}
                                            currentUserId={user.id}
                                            onEdit={handleEditActivity}
                                            onDelete={handleDeleteActivity}
                                            onUpdate={fetchTrip}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    ))
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No activities added yet. Click "Add Activity" to get started!
                    </Typography>
                )}
            </Box>

            {/* Activity Dialog */}
            <Dialog
                open={activityDialogOpen}
                onClose={() => {
                    setActivityDialogOpen(false);
                    resetActivityForm();
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>{editActivityId ? 'Edit Activity' : 'Add New Activity'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={activityForm.title}
                            onChange={(e) => setActivityForm({ ...activityForm, title: e.target.value })}
                            sx={{ mb: 2 }}
                            required
                            error={!activityForm.title}
                            helperText={!activityForm.title ? 'Required' : ''}
                        />

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
                                value={activityForm.date}
                                onChange={(newValue) => setActivityForm({ ...activityForm, date: newValue })}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        sx={{ mb: 2 }}
                                        required
                                        error={!activityForm.date}
                                        helperText={!activityForm.date ? 'Required' : ''}
                                    />
                                )}
                            />
                        </LocalizationProvider>

                        <TextField
                            fullWidth
                            label="Time (optional)"
                            type="time"
                            value={activityForm.time}
                            onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Category"
                            select
                            value={activityForm.category}
                            onChange={(e) => setActivityForm({ ...activityForm, category: e.target.value })}
                            sx={{ mb: 2 }}
                        >
                            <MenuItem value="AD">Adventure</MenuItem>
                            <MenuItem value="FD">Food</MenuItem>
                            <MenuItem value="ST">Sightseeing</MenuItem>
                            <MenuItem value="OT">Other</MenuItem>
                        </TextField>

                        <TextField
                            fullWidth
                            label="Estimated Cost (optional)"
                            type="number"
                            value={activityForm.estimated_cost}
                            onChange={(e) => setActivityForm({ ...activityForm, estimated_cost: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label="Notes (optional)"
                            multiline
                            rows={3}
                            value={activityForm.notes}
                            onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setActivityDialogOpen(false);
                        resetActivityForm();
                    }}>Cancel</Button>
                    <Button
                        onClick={handleActivitySubmit}
                        variant="contained"
                        disabled={!activityForm.title || !activityForm.date}
                    >
                        {editActivityId ? 'Save Changes' : 'Add Activity'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Invite User Dialog */}
            <Dialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)}>
                <DialogTitle>Invite User to Trip</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Email Address"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mt: 2 }}
                        error={!email}
                        helperText={!email ? 'Required' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleInviteUser}
                        variant="contained"
                        disabled={!email}
                    >
                        Invite
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default TripDetailPage;