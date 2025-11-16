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

import { Link } from "react-router-dom";
import ResultsContainer from "./result/ResultsContainer";
import { useScore } from "../contexts/ScoreContext";

const Results = ({ artists, correctGuess, guess }) => {
    const { score, streak, totalQuestions, correctAnswers, saveHighScore, getHighScores } = useScore();
    const [highScores, setHighScores] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);

    const isCorrect = correctGuess === guess;
    const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

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
        <div>
            <Box display="flex" justifyContent="center" alignItems="center">
                <h1 style={{ textAlign: "center" }}>
                    {isCorrect ? "Goed gedaan! 🎉" : "Jammer! Volgende keer beter! 💪"}
                </h1>
            </Box>

            {/* Score Card */}
            <Card style={{ marginBottom: "2rem", backgroundColor: isCorrect ? "#e8f5e9" : "#ffebee" }}>
                <CardContent>
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                        Score: {score} punten
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        🔥 Streak: {streak}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        ✅ Correcte antwoorden: {correctAnswers} / {totalQuestions}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        📊 Nauwkeurigheid: {accuracy}%
                    </Typography>
                </CardContent>
            </Card>

            <ResultsContainer
                artists={artists}
                correctGuess={correctGuess}
                guess={guess}
            />

            {/* Save Score Section */}
            {!scoreSaved && score > 0 && (
                <Card style={{ marginTop: "2rem", marginBottom: "1rem" }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Sla je score op!
                        </Typography>
                        <Box display="flex" gap={1} alignItems="center">
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
                                color="secondary"
                                onClick={handleSaveScore}
                            >
                                Opslaan
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            )}

            {scoreSaved && (
                <Typography variant="body1" style={{ color: "green", marginBottom: "1rem", textAlign: "center" }}>
                    Score opgeslagen! ✅
                </Typography>
            )}

            {/* Leaderboard */}
            {highScores.length > 0 && (
                <Card style={{ marginTop: "2rem", marginBottom: "2rem" }}>
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
                                    <TableCell align="right">Nauwkeurigheid</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {highScores.map((score, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{score.name}</TableCell>
                                        <TableCell align="right">{score.score}</TableCell>
                                        <TableCell align="right">{score.accuracy}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            <Box display="flex" justifyContent="center" alignItems="center" gap={2} m={5} style={{ gap: "1rem" }}>
                <Button component={Link} to="/" variant="contained" color="primary">
                    Home
                </Button>
            </Box>
        </div>
    );
};

export default Results;
