import React, { useState, useEffect, useRef } from 'react';
import {
    Paper,
    TextField,
    IconButton,
    Typography,
    Box,
    Avatar,
    Chip,
    Divider,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import socketService from '../services/socketService';

const useStyles = makeStyles((theme) => ({
    chatContainer: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: theme.spacing(2),
        background: 'linear-gradient(45deg, rgba(0, 229, 255, 0.1) 30%, rgba(213, 0, 249, 0.1) 90%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    },
    messagesContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1.5),
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '3px',
        },
    },
    messageWrapper: {
        display: 'flex',
        gap: theme.spacing(1),
        alignItems: 'flex-start',
    },
    messageContent: {
        flex: 1,
    },
    messageBubble: {
        padding: theme.spacing(1, 1.5),
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    systemMessage: {
        textAlign: 'center',
        padding: theme.spacing(1),
    },
    inputContainer: {
        padding: theme.spacing(2),
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        gap: theme.spacing(1),
    },
    timestamp: {
        fontSize: '0.7rem',
        opacity: 0.6,
        marginTop: theme.spacing(0.5),
    },
    avatar: {
        width: 32,
        height: 32,
    },
}));

const Chat = () => {
    const classes = useStyles();
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Listen for chat messages
        const handleChatMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        // Listen for initial game state (includes chat history)
        const handleGameState = (state) => {
            if (state.chatHistory) {
                setMessages(state.chatHistory);
            }
        };

        socketService.on('chatMessage', handleChatMessage);
        socketService.on('gameState', handleGameState);

        return () => {
            socketService.off('chatMessage', handleChatMessage);
            socketService.off('gameState', handleGameState);
        };
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        
        const trimmed = inputMessage.trim();
        if (trimmed) {
            socketService.sendMessage(trimmed);
            setInputMessage('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <Paper className={classes.chatContainer} elevation={3}>
            <Box className={classes.header}>
                <Typography variant="h6">💬 Chat</Typography>
            </Box>

            <Box className={classes.messagesContainer}>
                {messages.map((msg, index) => {
                    if (msg.sender === 'System') {
                        return (
                            <Box key={index} className={classes.systemMessage}>
                                <Chip 
                                    label={msg.text} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        );
                    }

                    return (
                        <Box key={index} className={classes.messageWrapper}>
                            <Avatar 
                                src={msg.avatar} 
                                className={classes.avatar}
                                alt={msg.sender}
                            />
                            <Box className={classes.messageContent}>
                                <Typography 
                                    variant="caption" 
                                    style={{ 
                                        fontWeight: 600,
                                        color: '#00e5ff'
                                    }}
                                >
                                    {msg.sender}
                                </Typography>
                                <Box className={classes.messageBubble}>
                                    <Typography variant="body2">
                                        {msg.text}
                                    </Typography>
                                </Box>
                                <Typography className={classes.timestamp}>
                                    {formatTime(msg.timestamp)}
                                </Typography>
                            </Box>
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            <form onSubmit={handleSendMessage} className={classes.inputContainer}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    size="small"
                    inputProps={{
                        maxLength: 200,
                    }}
                />
                <IconButton 
                    color="primary" 
                    type="submit"
                    disabled={!inputMessage.trim()}
                >
                    <SendIcon />
                </IconButton>
            </form>
        </Paper>
    );
};

export default Chat;
