import React, { useState, useEffect } from 'react';
import {
    Box,
    Avatar,
    Chip,
    Tooltip,
    Paper,
    Typography,
    Collapse,
    IconButton,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import PeopleIcon from '@material-ui/icons/People';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import { socketService } from '../features/multiplayer';

const useStyles = makeStyles((theme) => ({
    container: {
        position: 'fixed',
        top: theme.spacing(2),
        right: theme.spacing(2),
        zIndex: 1000,
        minWidth: 200,
        maxWidth: 300,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: theme.spacing(1, 2),
        background: 'linear-gradient(45deg, rgba(0, 229, 255, 0.1) 30%, rgba(213, 0, 249, 0.1) 90%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
    },
    playersList: {
        padding: theme.spacing(1),
        maxHeight: 300,
        overflowY: 'auto',
    },
    playerItem: {
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(1),
        marginBottom: theme.spacing(0.5),
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: 8,
        border: '1px solid rgba(255, 255, 255, 0.05)',
    },
    scoreChip: {
        marginLeft: 'auto',
        background: 'linear-gradient(45deg, #00e5ff 30%, #d500f9 90%)',
        color: '#fff',
        fontWeight: 700,
    },
    avatar: {
        width: 32,
        height: 32,
    },
}));

const MultiplayerPlayers = () => {
    const classes = useStyles();
    const [players, setPlayers] = useState([]);
    const [expanded, setExpanded] = useState(true);
    const [isMultiplayer, setIsMultiplayer] = useState(false);

    useEffect(() => {
        const socket = socketService.getSocket();
        
        // Only show if connected to multiplayer
        if (!socket || !socket.connected) {
            setIsMultiplayer(false);
            return;
        }

        setIsMultiplayer(true);

        const handleGameState = (state) => {
            if (state.users) {
                setPlayers(state.users);
            }
        };

        const handleUserJoined = (user) => {
            setPlayers(prev => [...prev, user]);
        };

        const handleUserLeft = (userId) => {
            setPlayers(prev => prev.filter(u => u.id !== userId));
        };

        const handleScoreUpdated = ({ userId, newScore }) => {
            setPlayers(prev => prev.map(u => 
                u.id === userId ? { ...u, score: newScore } : u
            ));
        };

        socketService.on('gameState', handleGameState);
        socketService.on('userJoined', handleUserJoined);
        socketService.on('userLeft', handleUserLeft);
        socketService.on('scoreUpdated', handleScoreUpdated);

        return () => {
            socketService.off('gameState', handleGameState);
            socketService.off('userJoined', handleUserJoined);
            socketService.off('userLeft', handleUserLeft);
            socketService.off('scoreUpdated', handleScoreUpdated);
        };
    }, []);

    if (!isMultiplayer || players.length === 0) {
        return null;
    }

    // Sort players by score
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <Paper className={classes.container} elevation={3}>
            <Box className={classes.header} onClick={() => setExpanded(!expanded)}>
                <Box display="flex" alignItems="center" gap={1}>
                    <PeopleIcon color="primary" />
                    <Typography variant="subtitle2">
                        Players ({players.length})
                    </Typography>
                </Box>
                <IconButton size="small">
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>

            <Collapse in={expanded}>
                <Box className={classes.playersList}>
                    {sortedPlayers.map((player, index) => (
                        <Tooltip 
                            key={player.id} 
                            title={player.isAdmin ? 'Admin' : 'Player'}
                            placement="left"
                        >
                            <Box className={classes.playerItem}>
                                <Typography 
                                    variant="caption" 
                                    style={{ 
                                        minWidth: 20,
                                        fontWeight: 700,
                                        color: index === 0 ? '#FFD700' : '#b0b0c3'
                                    }}
                                >
                                    #{index + 1}
                                </Typography>
                                <Avatar 
                                    src={player.avatar} 
                                    className={classes.avatar}
                                    alt={player.username}
                                />
                                <Typography variant="body2" noWrap>
                                    {player.username}
                                    {player.isAdmin && ' 👑'}
                                </Typography>
                                <Chip 
                                    label={player.score}
                                    size="small"
                                    className={classes.scoreChip}
                                />
                            </Box>
                        </Tooltip>
                    ))}
                </Box>
            </Collapse>
        </Paper>
    );
};

export default MultiplayerPlayers;
