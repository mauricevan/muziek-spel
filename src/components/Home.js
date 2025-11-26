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
    Slider
} from "@material-ui/core";
import { MusicNote, Timer, Album, People } from "@material-ui/icons";
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
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    },
    title: {
        marginBottom: theme.spacing(4),
        fontWeight: 800,
        background: "linear-gradient(45deg, #1DB954 30%, #1ED760 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    },
    formControl: {
        marginBottom: theme.spacing(3),
        width: "100%",
    },
    icon: {
        marginRight: theme.spacing(1),
        verticalAlign: "bottom",
    },
    startButton: {
        marginTop: theme.spacing(4),
        padding: theme.spacing(1.5, 6),
        fontSize: "1.2rem",
        background: "linear-gradient(45deg, #1DB954 30%, #1ED760 90%)",
        boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
        color: "white",
    },
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
        <Container maxWidth="sm" className={classes.root}>
            <Paper className={classes.paper} elevation={3}>
                <Typography variant="h3" align="center" className={classes.title}>
                    Muziek Raad Spelletje 🎵
                </Typography>
                
                <Typography variant="body1" align="center" style={{ marginBottom: '2rem', color: '#b3b3b3' }}>
                    Test je muziekkennis in Arcade Mode!
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl variant="outlined" className={classes.formControl}>
                            <InputLabel><MusicNote className={classes.icon}/> Genre</InputLabel>
                            <Select
                                value={localConfig.selectedGenre || "pop"}
                                onChange={(e) => handleChange("selectedGenre", e.target.value)}
                                label="Genre"
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
                        <Typography gutterBottom>
                            <Timer className={classes.icon}/> Preview Duur: {localConfig.previewDuration || 30}s
                        </Typography>
                        <Slider
                            value={localConfig.previewDuration || 30}
                            onChange={(_, val) => handleChange("previewDuration", val)}
                            min={5}
                            max={30}
                            step={5}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </Grid>

                    <Grid item xs={12}>
                         <Typography gutterBottom>
                            <People className={classes.icon}/> Aantal Opties: {localConfig.qtyArtists || 2}
                        </Typography>
                        <Slider
                            value={localConfig.qtyArtists || 2}
                            onChange={(_, val) => handleChange("qtyArtists", val)}
                            min={2}
                            max={6}
                            step={1}
                            marks
                            valueLabelDisplay="auto"
                        />
                    </Grid>
                </Grid>

                <Box display="flex" justifyContent="center">
                    <Button
                        variant="contained"
                        className={classes.startButton}
                        onClick={handleStart}
                    >
                        Start Game 🎮
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Home;
