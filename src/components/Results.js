import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

import { Link } from "react-router-dom";
import { useScore } from "../contexts/ScoreContext";

const useStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(3),
        textAlign: 'center',
    },
    scoreCard: {
        marginBottom: theme.spacing(4),
        background: 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)',
        color: 'white',
        borderRadius: 16,
    },
    highlight: {
        color: theme.palette.primary.main,
        fontWeight: 'bold',
    }
}));

const Results = () => {
    const classes = useStyles();
    const { score, streak, round, correctAnswers, saveHighScore, getHighScores } = useScore();
    const [highScores, setHighScores] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);

    useEffect(() => {
        setHighScores(getHighScores());
    }, []);

    const handleSaveScore = () => {
        if (playerName.trim()) {
            saveHighScore(playerName);
            setHighScores(getHighScores());
            setScoreSaved(true);
        } else {
            alert('Vul een naam in om je score op te slaan!');
        }
    };

    return (
        <div className={classes.root}>
            <Typography variant="h2" gutterBottom>
                Game Over! 🎮
            </Typography>

            <Card className={classes.scoreCard} elevation={5}>
                <CardContent>
                    <Typography variant="h3" gutterBottom className={classes.highlight}>
                        {score} Punten
                    </Typography>
                    <Box display="flex" justifyContent="space-around" mt={2}>
                        <Box>
                            <Typography variant="h6">Rondes</Typography>
                            <Typography variant="h4">{round - 1}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6">Streak</Typography>
                            <Typography variant="h4">{streak}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="h6">Correct</Typography>
                            <Typography variant="h4">{correctAnswers}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Save Score Section */}
            {!scoreSaved && score > 0 && (
                <Card style={{ marginBottom: "2rem" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Sla je score op!
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center" justifyContent="center">
                            <TextField
                                label="Je naam"
                                variant="outlined"
                                size="small"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSaveScore();
                                    }
                                }}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSaveScore}
                            >
                                Opslaan
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {scoreSaved && (
                <Typography variant="body1" style={{ color: "#1DB954", marginBottom: "1rem", fontWeight: 'bold' }}>
                    Score opgeslagen! ✅
                </Typography>
            )}

            {/* Leaderboard */}
            {highScores.length > 0 && (
                <Card style={{ marginBottom: "2rem" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            🏆 Top 10 High Scores
                        </Typography>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Naam</TableCell>
                                    <TableCell align="right">Score</TableCell>
                                    <TableCell align="right">Rondes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {highScores.map((s, index) => (
                                    <TableRow key={index} selected={s.score === score && s.name === playerName}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{s.name}</TableCell>
                                        <TableCell align="right">{s.score}</TableCell>
                                        <TableCell align="right">{s.rounds || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Box display="flex" justifyContent="center" gap={2}>
                <Button 
                    component={Link} 
                    to="/" 
                    variant="contained" 
                    color="primary"
                    size="large"
                >
                    Opnieuw Spelen 🔄
                </Button>
            </Box>
        </div>
    );
};

export default Results;
