import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
    Paper,
    Button,
    Typography,
    Box,
    Grid,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Slider,
    Divider,
    Container,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import SettingsIcon from '@material-ui/icons/Settings';
import PeopleIcon from '@material-ui/icons/People';
import { socketService } from '../features/multiplayer';
import Chat from './Chat';
import { GENRES } from '../constants/genres';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(3),
        minHeight: '100vh',
    },
    header: {
        marginBottom: theme.spacing(3),
        textAlign: 'center',
    },
    gridContainer: {
        height: 'calc(100vh - 200px)',
    },
    paper: {
        padding: theme.spacing(3),
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    chatPaper: {
        height: '100%',
    },
    playersList: {
        flex: 1,
        overflowY: 'auto',
        marginTop: theme.spacing(2),
    },
    playerItem: {
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        marginBottom: theme.spacing(1),
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    adminBadge: {
        background: 'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
        color: '#000',
        fontWeight: 700,
    },
    settingsSection: {
        marginTop: theme.spacing(2),
        flex: 1,
        overflowY: 'auto',
    },
    formControl: {
        marginBottom: theme.spacing(2),
        width: '100%',
    },
    startButton: {
        marginTop: theme.spacing(3),
        padding: theme.spacing(1.5),
        fontSize: '1.1rem',
    },
    scoreChip: {
        background: 'linear-gradient(45deg, #00e5ff 30%, #d500f9 90%)',
        color: '#fff',
        fontWeight: 700,
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        marginBottom: theme.spacing(2),
    },
}));

const Lobby = () => {
    const classes = useStyles();
    const history = useHistory();
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [settings, setSettings] = useState({
        selectedGenre: 'pop',
        qtySongs: 1,
        qtyArtists: 2,
        previewDuration: 30,
    });

    useEffect(() => {
        const username = localStorage.getItem('musicGameUsername');
        if (!username) {
            history.push('/login');
            return;
        }

        // Listen for game state updates
        const handleGameState = (state) => {
            setUsers(state.users || []);
            setSettings(state.settings || settings);
            
            // Find current user
            const socket = socketService.getSocket();
            if (socket) {
                const user = state.users.find(u => u.id === socket.id);
                if (user) {
                    setCurrentUser(user);
                    setIsAdmin(user.isAdmin);
                }
            }
        };

        const handleUserJoined = (user) => {
            setUsers(prev => [...prev, user]);
        };

        const handleUserLeft = (userId) => {
            setUsers(prev => prev.filter(u => u.id !== userId));
        };

        const handleSettingsUpdated = (newSettings) => {
            setSettings(newSettings);
        };

        const handleYouAreAdmin = () => {
            setIsAdmin(true);
        };

        const handleAdminChanged = (newAdmin) => {
            setUsers(prev => prev.map(u => ({
                ...u,
                isAdmin: u.id === newAdmin.id
            })));
        };

        const handleGameStarted = (gameState) => {
            // Navigate to game with settings
            history.push('/guess');
        };

        const handleScoreUpdated = ({ userId, newScore }) => {
            setUsers(prev => prev.map(u => 
                u.id === userId ? { ...u, score: newScore } : u
            ));
        };

        socketService.on('gameState', handleGameState);
        socketService.on('userJoined', handleUserJoined);
        socketService.on('userLeft', handleUserLeft);
        socketService.on('settingsUpdated', handleSettingsUpdated);
        socketService.on('youAreAdmin', handleYouAreAdmin);
        socketService.on('adminChanged', handleAdminChanged);
        socketService.on('gameStarted', handleGameStarted);
        socketService.on('scoreUpdated', handleScoreUpdated);

        return () => {
            socketService.off('gameState', handleGameState);
            socketService.off('userJoined', handleUserJoined);
            socketService.off('userLeft', handleUserLeft);
            socketService.off('settingsUpdated', handleSettingsUpdated);
            socketService.off('youAreAdmin', handleYouAreAdmin);
            socketService.off('adminChanged', handleAdminChanged);
            socketService.off('gameStarted', handleGameStarted);
            socketService.off('scoreUpdated', handleScoreUpdated);
        };
    }, [history]);

    const handleSettingChange = (key, value) => {
        if (isAdmin) {
            const newSettings = { ...settings, [key]: value };
            setSettings(newSettings);
            socketService.updateSettings(newSettings);
        }
    };

    const handleStartGame = () => {
        if (isAdmin) {
            socketService.startGame();
        }
    };

    return (
        <Container maxWidth="lg" className={classes.root}>
            <Box className={classes.header}>
                <Typography variant="h3">
                    🎵 Game Lobby
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    {isAdmin ? '👑 You are the admin!' : 'Waiting for admin to start the game...'}
                </Typography>
            </Box>

            <Grid container spacing={3} className={classes.gridContainer}>
                {/* Players Panel */}
                <Grid item xs={12} md={4}>
                    <Paper className={classes.paper} elevation={3}>
                        <Box className={classes.sectionHeader}>
                            <PeopleIcon color="primary" />
                            <Typography variant="h6">
                                Players ({users.length})
                            </Typography>
                        </Box>
                        
                        <Divider />
                        
                        <List className={classes.playersList}>
                            {users.map((user) => (
                                <ListItem key={user.id} className={classes.playerItem}>
                                    <ListItemAvatar>
                                        <Avatar src={user.avatar} alt={user.username} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography variant="body1">
                                                    {user.username}
                                                </Typography>
                                                {user.isAdmin && (
                                                    <Chip
                                                        icon={<StarIcon />}
                                                        label="Admin"
                                                        size="small"
                                                        className={classes.adminBadge}
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Chip
                                                label={`Score: ${user.score}`}
                                                size="small"
                                                className={classes.scoreChip}
                                            />
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* Settings Panel */}
                <Grid item xs={12} md={4}>
                    <Paper className={classes.paper} elevation={3}>
                        <Box className={classes.sectionHeader}>
                            <SettingsIcon color="primary" />
                            <Typography variant="h6">
                                Game Settings
                            </Typography>
                        </Box>
                        
                        <Divider />
                        
                        <Box className={classes.settingsSection}>
                            <FormControl className={classes.formControl}>
                                <InputLabel>Genre</InputLabel>
                                <Select
                                    value={settings.selectedGenre}
                                    onChange={(e) => handleSettingChange('selectedGenre', e.target.value)}
                                    disabled={!isAdmin}
                                >
                                    {GENRES.map((genre) => (
                                        <MenuItem key={genre.value} value={genre.value}>
                                            {genre.emoji} {genre.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl className={classes.formControl}>
                                <Typography gutterBottom>
                                    Number of Songs: {settings.qtySongs}
                                </Typography>
                                <Slider
                                    value={settings.qtySongs}
                                    onChange={(e, val) => handleSettingChange('qtySongs', val)}
                                    min={1}
                                    max={10}
                                    marks
                                    disabled={!isAdmin}
                                    valueLabelDisplay="auto"
                                />
                            </FormControl>

                            <FormControl className={classes.formControl}>
                                <Typography gutterBottom>
                                    Number of Artists: {settings.qtyArtists}
                                </Typography>
                                <Slider
                                    value={settings.qtyArtists}
                                    onChange={(e, val) => handleSettingChange('qtyArtists', val)}
                                    min={2}
                                    max={6}
                                    marks
                                    disabled={!isAdmin}
                                    valueLabelDisplay="auto"
                                />
                            </FormControl>

                            <FormControl className={classes.formControl}>
                                <Typography gutterBottom>
                                    Preview Duration: {settings.previewDuration}s
                                </Typography>
                                <Slider
                                    value={settings.previewDuration}
                                    onChange={(e, val) => handleSettingChange('previewDuration', val)}
                                    min={10}
                                    max={60}
                                    step={5}
                                    marks
                                    disabled={!isAdmin}
                                    valueLabelDisplay="auto"
                                />
                            </FormControl>

                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    size="large"
                                    className={classes.startButton}
                                    startIcon={<PlayArrowIcon />}
                                    onClick={handleStartGame}
                                    disabled={users.length < 1}
                                >
                                    Start Game
                                </Button>
                            )}

                            {!isAdmin && (
                                <Box mt={3} textAlign="center">
                                    <Typography variant="body2" color="textSecondary">
                                        Only the admin can change settings and start the game
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* Chat Panel */}
                <Grid item xs={12} md={4}>
                    <Box className={classes.chatPaper}>
                        <Chat />
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Lobby;
