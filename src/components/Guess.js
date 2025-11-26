import React, { useEffect, useState, useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Fade,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayAudiosContainer from "./guess/PlayAudiosContainer";
import GuessChoicesContainer from "./guess/GuessChoicesContainer";
import Volume from "./guess/Volume";
import LoadingSpinner from "./shared/LoadingSpinner";
import { useScore } from "../contexts/ScoreContext";
import { useGameLogic } from "../hooks/useGameLogic";
import { Howler } from "howler";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
  },
  lives: {
    color: "#ff5252",
    fontWeight: "bold",
  },
  score: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
  },
  feedbackOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
  timerBar: {
    height: 10,
    borderRadius: 5,
    marginBottom: theme.spacing(2),
  },
}));

const Guess = ({ config }) => {
  const classes = useStyles();
  const history = useHistory();
  const { startQuestion, answerQuestion, lives, score, round, gameOver } =
    useScore();
  const { getArtists, getSongs, loading, error } = useGameLogic();

  const [artists, setArtists] = useState([]);
  const [songs, setSongs] = useState([]);
  const [correctGuess, setCorrectGuess] = useState(null);
  const [feedbackColor, setFeedbackColor] = useState(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  const loadNewQuestion = useCallback(async () => {
    Howler.stop();
    setSongs([]);
    setTimeLeft(30); // Reset timer

    const artistsData = await getArtists(
      config.selectedGenre,
      config.qtyArtists
    );
    if (!artistsData) return;

    const { _artists, _correctIdx } = artistsData;
    setArtists(_artists);
    setCorrectGuess(_artists[_correctIdx].name);

    const _songs = await getSongs(_artists, _correctIdx, config.qtySongs);
    setSongs(_songs);
  }, [
    config.selectedGenre,
    config.qtyArtists,
    config.qtySongs,
    getArtists,
    getSongs,
  ]);

  const handleGuess = useCallback(
    async (artistName) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = artistName === correctGuess;

      setFeedbackColor(
        isCorrect ? "rgba(0, 255, 0, 0.3)" : "rgba(255, 0, 0, 0.3)"
      );
      setTimeout(() => setFeedbackColor(null), 500);

      answerQuestion(isCorrect);

      if (isCorrect || lives > 1) {
        setTimeout(() => {
          loadNewQuestion();
        }, 1000);
      }
    },
    [correctGuess, answerQuestion, lives, loadNewQuestion]
  );

  useEffect(() => {
    loadNewQuestion();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      Howler.stop();
    };
  }, [loadNewQuestion]);

  useEffect(() => {
    if (songs && songs.length === config.qtySongs) {
      startQuestion();

      // Start Timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleGuess(null); // Time's up!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [songs, handleGuess, startQuestion, config.qtySongs]);

  useEffect(() => {
    if (gameOver) {
      if (timerRef.current) clearInterval(timerRef.current);
      history.push("/results");
    }
  }, [gameOver, history]);

  if (loading || !songs || songs.length !== config.qtySongs) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="50vh"
      >
        <LoadingSpinner />
        <Typography variant="h6" style={{ marginTop: "1rem" }}>
          Ronde {round} wordt geladen...
        </Typography>
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <Fade in={!!feedbackColor} timeout={200}>
        <div
          className={classes.feedbackOverlay}
          style={{ backgroundColor: feedbackColor }}
        />
      </Fade>

      <Paper className={classes.header} elevation={3}>
        <Typography className={classes.lives}>
          Lives: {"❤️".repeat(lives)}
        </Typography>
        <Typography variant="h6">Ronde {round}</Typography>
        <Typography className={classes.score}>Score: {score}</Typography>
      </Paper>

      <LinearProgress
        variant="determinate"
        value={(timeLeft / 30) * 100}
        className={classes.timerBar}
        color={timeLeft < 10 ? "secondary" : "primary"}
      />

      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Welke artiest is dit? 🎵
      </h1>

      <Box display="flex" justifyContent="center" alignItems="center">
        <PlayAudiosContainer
          songs={songs}
          previewDuration={config.previewDuration || 30}
        />
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        style={{ margin: "2rem" }}
      >
        <Volume />
      </Box>

      <Box display="flex" justifyContent="center" alignItems="center">
        <GuessChoicesContainer
          artists={artists}
          onGuess={handleGuess}
          correctGuess={correctGuess}
        />
      </Box>
    </div>
  );
};

export default Guess;
