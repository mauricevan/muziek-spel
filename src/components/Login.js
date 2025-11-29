import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
    Paper,
    TextField,
    Button,
    Typography,
    Box,
    Avatar,
    Fade,
    Container
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import MusicNoteIcon from '@material-ui/icons/MusicNote';
import socketService from '../services/socketService';

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        padding: theme.spacing(4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: theme.spacing(3),
        maxWidth: 400,
        width: '100%',
    },
    avatar: {
        width: theme.spacing(12),
        height: theme.spacing(12),
        background: 'linear-gradient(45deg, #00e5ff 30%, #d500f9 90%)',
        marginBottom: theme.spacing(2),
    },
    title: {
        textAlign: 'center',
        marginBottom: theme.spacing(2),
    },
    form: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2),
    },
    previewAvatar: {
        width: theme.spacing(8),
        height: theme.spacing(8),
        margin: '0 auto',
    }
}));

const Login = () => {
    const classes = useStyles();
    const history = useHistory();
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [previewAvatar, setPreviewAvatar] = useState('');
    const [error, setError] = useState('');
    
    // Check if user is starting a new game
    const isStartingNewGame = new URLSearchParams(location.search).get('startGame') === 'true';

    useEffect(() => {
        // Check if user has a saved username
        const savedUsername = localStorage.getItem('musicGameUsername');
        if (savedUsername) {
            setUsername(savedUsername);
            setPreviewAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${savedUsername}`);
        }
    }, []);

    useEffect(() => {
        // Update preview avatar when username changes
        if (username.trim()) {
            setPreviewAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${username.trim()}`);
        } else {
            setPreviewAvatar('');
        }
    }, [username]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const trimmedUsername = username.trim();
        
        if (!trimmedUsername) {
            setError('Please enter a username');
            return;
        }

        if (trimmedUsername.length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }

        if (trimmedUsername.length > 20) {
            setError('Username must be less than 20 characters');
            return;
        }

        // Save username to localStorage for persistence
        localStorage.setItem('musicGameUsername', trimmedUsername);

        // Connect to socket and join
        socketService.connect();
        socketService.join(trimmedUsername);

        // Navigate to lobby
        history.push('/lobby');
    };

    return (
        <Container className={classes.root}>
            <Fade in timeout={800}>
                <Paper className={classes.paper} elevation={3}>
                    <Avatar className={classes.avatar}>
                        <MusicNoteIcon style={{ fontSize: 60 }} />
                    </Avatar>
                    
                    <Typography variant="h4" className={classes.title}>
                        🎵 Music Guessing Game
                    </Typography>
                    
                    <Typography variant="body1" color="textSecondary" align="center">
                        {isStartingNewGame 
                            ? '👑 Start a new game and become the admin!'
                            : 'Enter your username to join the multiplayer party!'
                        }
                    </Typography>
                    
                    {isStartingNewGame && (
                        <Box 
                            style={{ 
                                background: 'rgba(255, 215, 0, 0.1)', 
                                border: '1px solid rgba(255, 215, 0, 0.3)',
                                borderRadius: 8,
                                padding: 12,
                                width: '100%'
                            }}
                        >
                            <Typography variant="body2" style={{ color: '#FFD700', textAlign: 'center' }}>
                                ⭐ As the first player, you'll be the admin and can control game settings!
                            </Typography>
                        </Box>
                    )}

                    {previewAvatar && (
                        <Fade in timeout={300}>
                            <Avatar 
                                src={previewAvatar} 
                                className={classes.previewAvatar}
                                alt={username}
                            />
                        </Fade>
                    )}

                    <form className={classes.form} onSubmit={handleSubmit}>
                        <TextField
                            label="Username"
                            variant="outlined"
                            fullWidth
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            error={!!error}
                            helperText={error}
                            autoFocus
                            inputProps={{
                                maxLength: 20,
                            }}
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            fullWidth
                        >
                            {isStartingNewGame ? 'Start Game' : 'Join Game'}
                        </Button>
                    </form>

                    <Box mt={2}>
                        <Typography variant="caption" color="textSecondary" align="center">
                            Your username and score will be remembered
                        </Typography>
                    </Box>
                </Paper>
            </Fade>
        </Container>
    );
};

export default Login;
