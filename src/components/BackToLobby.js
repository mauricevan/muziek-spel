import React from 'react';
import { useHistory } from 'react-router-dom';
import { IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { socketService } from '../features/multiplayer';

const useStyles = makeStyles((theme) => ({
    backButton: {
        position: 'fixed',
        top: theme.spacing(2),
        left: theme.spacing(2),
        zIndex: 1000,
        background: 'rgba(22, 22, 34, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '&:hover': {
            background: 'rgba(0, 229, 255, 0.2)',
            borderColor: theme.palette.primary.main,
        }
    },
}));

const BackToLobby = () => {
    const classes = useStyles();
    const history = useHistory();
    const socket = socketService.getSocket();

    // Only show if connected to multiplayer
    if (!socket || !socket.connected) {
        return null;
    }

    const handleBack = () => {
        history.push('/lobby');
    };

    return (
        <Tooltip title="Back to Lobby" placement="right">
            <IconButton 
                className={classes.backButton}
                onClick={handleBack}
                color="primary"
            >
                <ArrowBackIcon />
            </IconButton>
        </Tooltip>
    );
};

export default BackToLobby;
