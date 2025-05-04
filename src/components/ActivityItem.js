import { useState } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Chip, 
    Box, 
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    InputAdornment
} from '@mui/material';
import { 
    ThumbUp, 
    ThumbDown, 
    MoreVert,
    Edit,
    Delete
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tripService from '../api/trips';
import { useAuth } from '../contexts/AuthContext';

const ActivityItem = ({ activity, onVote, currentUserId, onEdit, onDelete, onUpdate }) => {
    const { user } = useAuth();
    const [anchorEl, setAnchorEl] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isVoting, setIsVoting] = useState(false);
    
    // Edit form state
    const [title, setTitle] = useState(activity.title);
    const [date, setDate] = useState(new Date(activity.date));
    const [time, setTime] = useState(activity.time || '');
    const [category, setCategory] = useState(activity.category);
    const [estimatedCost, setEstimatedCost] = useState(activity.estimated_cost || '');
    const [notes, setNotes] = useState(activity.notes || '');
    
    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    
    const handleMenuClose = () => {
        setAnchorEl(null);
    };
    
    const handleEdit = () => {
        setEditDialogOpen(true);
        handleMenuClose();
    };
    
    const handleDelete = () => {
        setDeleteDialogOpen(true);
        handleMenuClose();
    };
    
    const handleUpdateActivity = async () => {
        try {
            const activityData = {
                title,
                date: date.toISOString().split('T')[0],
                time: time || null,
                category,
                estimated_cost: estimatedCost ? parseFloat(estimatedCost) : null,
                notes: notes || null,
            };
            
            await tripService.updateActivity(
                activity.trip,
                activity.id,
                activityData,
                user.access
            );
            
            setEditDialogOpen(false);
            onEdit && onEdit({ ...activity, ...activityData });
            onUpdate && await onUpdate();
        } catch (err) {
            console.error('Failed to update activity:', err);
        }
    };
    
    const handleConfirmDelete = async () => {
        try {
            await tripService.deleteActivity(
                activity.trip,
                activity.id,
                user.access
            );
            setDeleteDialogOpen(false);
            onDelete && await onDelete(activity.id);
            onUpdate && await onUpdate();
        } catch (err) {
            console.error('Failed to delete activity:', err);
        }
    };
    
    const handleVote = async (voteValue) => {
        if (isVoting) return;
        
        setIsVoting(true);
        try {
            await onVote(activity.id, voteValue);
        } catch (err) {
            console.error('Failed to vote:', err);
        } finally {
            setIsVoting(false);
        }
    };

    const userVote = activity.votes?.find(vote => vote.user === currentUserId);
    const upvotes = activity.votes?.filter(vote => vote.vote).length || 0;
    const downvotes = activity.votes?.filter(vote => !vote.vote).length || 0;
    
    const categoryMap = {
        'AD': 'Adventure',
        'FD': 'Food',
        'ST': 'Sightseeing',
        'OT': 'Other'
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" component="h3">
                        {activity.title}
                    </Typography>
                    
                    {activity.created_by === currentUserId && (
                        <IconButton size="small" onClick={handleMenuOpen}>
                            <MoreVert />
                        </IconButton>
                    )}
                </Box>
                
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={handleEdit}>
                        <Edit sx={{ mr: 1 }} /> Edit
                    </MenuItem>
                    <MenuItem onClick={handleDelete}>
                        <Delete sx={{ mr: 1 }} /> Delete
                    </MenuItem>
                </Menu>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <Chip 
                        label={categoryMap[activity.category]} 
                        size="small" 
                        sx={{ mr: 1 }} 
                    />
                    {activity.time && (
                        <Typography variant="body2" color="text.secondary">
                            {activity.time}
                        </Typography>
                    )}
                </Box>
                
                {activity.estimated_cost && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Estimated Cost:</strong> ${activity.estimated_cost}
                    </Typography>
                )}
                
                {activity.notes && (
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        {activity.notes}
                    </Typography>
                )}
                
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    borderTop: '1px solid #eee',
                    pt: 1,
                    mt: 2
                }}>
                    <IconButton 
                        size="small" 
                        color={userVote?.vote ? 'primary' : 'default'}
                        onClick={() => handleVote(true)}
                        disabled={isVoting}
                    >
                        <ThumbUp fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                        {upvotes}
                    </Typography>
                    
                    <IconButton 
                        size="small" 
                        color={userVote?.vote === false ? 'error' : 'default'}
                        onClick={() => handleVote(false)}
                        disabled={isVoting}
                    >
                        <ThumbDown fontSize="small" />
                    </IconButton>
                    <Typography variant="body2">
                        {downvotes}
                    </Typography>
                </Box>
            </CardContent>
            
            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Activity</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            sx={{ mb: 2 }}
                            required
                        />
                        
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Date"
                                value={date}
                                onChange={(newValue) => setDate(newValue)}
                                renderInput={(params) => (
                                    <TextField {...params} fullWidth sx={{ mb: 2 }} required />
                                )}
                            />
                        </LocalizationProvider>
                        
                        <TextField
                            fullWidth
                            label="Time (optional)"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                        />
                        
                        <TextField
                            fullWidth
                            label="Category"
                            select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
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
                            value={estimatedCost}
                            onChange={(e) => setEstimatedCost(e.target.value)}
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
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleUpdateActivity} 
                        variant="contained"
                        disabled={!title || !date}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>Are you sure you want to delete this activity?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleConfirmDelete} 
                        variant="contained"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default ActivityItem;