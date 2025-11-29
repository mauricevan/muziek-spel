import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Fade,
    Divider
} from "@material-ui/core";
import { MusicNote, Timer, Album, People, PlayArrow, Group, Star } from "@material-ui/icons";
import { useScore } from "../contexts/ScoreContext";

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: theme.spacing(4),
    },
    paper: {
        padding: theme.spacing(4),
        // Glassmorphism handled by theme override
        borderRadius: theme.shape.borderRadius * 2,
        position: 'relative',
        overflow: 'hidden',
    },
    title: {
        marginBottom: theme.spacing(2),
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: theme.spacing(4),
        color: theme.palette.text.secondary,
        textAlign: 'center',
        fontWeight: 500,
    },
    formControl: {
        marginBottom: theme.spacing(3),
        width: "100%",
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
                borderColor: theme.palette.primary.main,
            },
        },
    },
    icon: {
        marginRight: theme.spacing(1),
        verticalAlign: "bottom",
        color: theme.palette.primary.main,
    },
    startButton: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(2, 6),
        fontSize: "1.2rem",
        width: '100%',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        boxShadow: `0 4px 20px rgba(0, 229, 255, 0.4)`,
        '&:hover': {
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 10%, ${theme.palette.secondary.main} 80%)`,
        }
    },
    startMultiplayerButton: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2, 6),
        fontSize: "1.2rem",
        width: '100%',
        background: `linear-gradient(45deg, #FFD700 30%, #FFA500 90%)`,
        boxShadow: `0 4px 20px rgba(255, 215, 0, 0.4)`,
        color: '#000',
        fontWeight: 700,
        '&:hover': {
            background: `linear-gradient(45deg, #FFD700 10%, #FFA500 80%)`,
        }
    },
    multiplayerButton: {
        marginTop: theme.spacing(2),
        padding: theme.spacing(2, 6),
        fontSize: "1.2rem",
        width: '100%',
        background: `linear-gradient(45deg, #d500f9 30%, #aa00ff 90%)`,
        boxShadow: `0 4px 20px rgba(213, 0, 249, 0.4)`,
        '&:hover': {
            background: `linear-gradient(45deg, #d500f9 10%, #aa00ff 80%)`,
        }
    },
    label: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(1),
        color: theme.palette.text.primary,
        fontWeight: 600,
    },
    slider: {
        color: theme.palette.secondary.main,
    }
}));

const GENRES = ["pop", "rock", "hip-hop", "electronic", "jazz", "classical", "country", "r-n-b", "latin", "indie"];

const Home = ({ config, setConfig }) => {
    const classes = useStyles();
    const history = useHistory();
    const { resetGame } = useScore();
    
    const [localConfig, setLocalConfig] = useState(config);

    const handleChange = (key, value) => {
        setLocalConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleStart = () => {
        // Save to parent state and localStorage
        setConfig(localConfig);
        localStorage.setItem("selectedGenre", localConfig.selectedGenre);
        localStorage.setItem("qtyArtists", localConfig.qtyArtists);
        localStorage.setItem("qtySongs", localConfig.qtySongs);
        localStorage.setItem("previewDuration", localConfig.previewDuration || 30);
        
        resetGame(); // Reset score, lives, round
        history.push("/guess");
    };

    return (
        <Fade in={true} timeout={800}>
            <Container maxWidth="sm" className={classes.root}>
                <Paper className={classes.paper} elevation={3}>
                    <Typography variant="h1" className={classes.title}>
                        MUZIEK RAAD
                    </Typography>
                    
                    <Typography variant="body1" className={classes.subtitle}>
                        ARCADE MODE • GUESS THE ARTIST • BEAT THE CLOCK
                    </Typography>

                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <FormControl variant="outlined" className={classes.formControl}>
                                <InputLabel style={{ color: '#b0b0c3' }}>Genre</InputLabel>
                                <Select
                                    value={localConfig.selectedGenre || "pop"}
                                    onChange={(e) => handleChange("selectedGenre", e.target.value)}
                                    label="Genre"
                                    style={{ color: 'white' }}
                                >
                                    {GENRES.map((genre) => (
                                        <MenuItem key={genre} value={genre}>
                                            {genre.charAt(0).toUpperCase() + genre.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography className={classes.label}>
                                <Timer className={classes.icon}/> Preview Duration: {localConfig.previewDuration || 30}s
                            </Typography>
                            <Slider
                                value={localConfig.previewDuration || 30}
                                onChange={(_, val) => handleChange("previewDuration", val)}
                                min={5}
                                max={30}
                                step={5}
                                marks
                                valueLabelDisplay="auto"
                                className={classes.slider}
                            />
                        </Grid>

                        <Grid item xs={12}>
                             <Typography className={classes.label}>
                                <People className={classes.icon}/> Difficulty (Options): {localConfig.qtyArtists || 2}
                            </Typography>
                            <Slider
                                value={localConfig.qtyArtists || 2}
                                onChange={(_, val) => handleChange("qtyArtists", val)}
                                min={2}
                                max={6}
                                step={1}
                                marks
                                valueLabelDisplay="auto"
                                className={classes.slider}
                            />
                        </Grid>
                    </Grid>

                    <Box display="flex" flexDirection="column" justifyContent="center">
                        <Button
                            variant="contained"
                            className={classes.startButton}
                            onClick={handleStart}
                            endIcon={<PlayArrow />}
                        >
                            START SOLO GAME
                        </Button>
                        
                        <Box position="relative" my={2}>
                            <Divider style={{ opacity: 0.3 }} />
                            <Typography 
                                variant="caption" 
                                style={{ 
                                    color: '#b0b0c3',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    background: '#161622',
                                    padding: '0 16px'
                                }}
                            >
                                OR
                            </Typography>
                        </Box>
                        
                        <Button
                            variant="contained"
                            className={classes.startMultiplayerButton}
                            onClick={() => history.push('/login?startGame=true')}
                            endIcon={<Star />}
                        >
                            👑 START MULTIPLAYER GAME
                        </Button>
                        
                        <Button
                            variant="contained"
                            className={classes.multiplayerButton}
                            onClick={() => history.push('/login')}
                            endIcon={<Group />}
                            style={{ marginTop: 8 }}
                        >
                            JOIN EXISTING GAME
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Fade>
    );
};

export default Home;
