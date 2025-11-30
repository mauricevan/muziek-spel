import React, { useEffect, useState, useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import {
  Box,
  Typography,
  LinearProgress,
  Paper,
  Fade,
  Container,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import PlayAudiosContainer from "./guess/PlayAudiosContainer";
import GuessChoicesContainer from "./guess/GuessChoicesContainer";
import Volume from "./guess/Volume";
import { LoadingSpinner } from "./common";
import MultiplayerPlayers from "./MultiplayerPlayers";
import BackToLobby from "./BackToLobby";
import { useScore } from "../contexts/ScoreContext";
import { useGameLogic } from "../features/game";
import { Howler } from "howler";
import { socketService } from "../features/multiplayer";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2, 3),
    // Glassmorphism handled by theme override
    borderRadius: 20,
    background: 'rgba(22, 22, 34, 0.6)',
  },
  lives: {
    color: "#ff5252",
    fontWeight: "bold",
    fontSize: "1.2rem",
    textShadow: "0 0 10px rgba(255, 82, 82, 0.5)",
  },
  score: {
    color: theme.palette.primary.main,
    fontWeight: "bold",
    fontSize: "1.2rem",
    textShadow: `0 0 10px ${theme.palette.primary.main}`,
  },
  round: {
    color: theme.palette.text.secondary,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
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
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing(4),
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    "& .MuiLinearProgress-bar": {
        borderRadius: 4,
    }
  },
  questionTitle: {
      textAlign: "center",
      marginBottom: theme.spacing(4),
      fontWeight: 800,
      fontSize: "2rem",
      background: `linear-gradient(45deg, #fff 30%, ${theme.palette.text.secondary} 90%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
  },
  gameContainer: {
      background: 'rgba(22, 22, 34, 0.4)',
      backdropFilter: 'blur(20px)',
      borderRadius: 24,
      padding: theme.spacing(4),
      border: '1px solid rgba(255, 255, 255, 0.05)',
  }
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
  const loadNewQuestionRef = useRef(null);
  const livesRef = useRef(lives);
  const answerQuestionRef = useRef(answerQuestion);
  const usedArtistNamesRef = useRef([]);

  const loadNewQuestion = useCallback(async () => {
    Howler.stop();
    setSongs([]);
    setTimeLeft(30); // Reset timer

    // Ensure we have a valid genre (fallback to 'pop' if null/undefined)
    const genre = config.selectedGenre || 'pop';

    const artistsData = await getArtists(
      genre,
      config.qtyArtists,
      usedArtistNamesRef.current
    );
    if (!artistsData) return;

    const { _artists, _correctIdx } = artistsData;
    setArtists(_artists);
    const correctName = _artists[_correctIdx].name;
    setCorrectGuess(correctName);
    
    // Add to used list
    usedArtistNamesRef.current.push(correctName);

    const _songs = await getSongs(_artists, _correctIdx, config.qtySongs);
    setSongs(_songs);
  }, [
    config.selectedGenre,
    config.qtyArtists,
    config.qtySongs,
    getArtists,
    getSongs,
  ]);

  // Keep refs updated with latest values
  useEffect(() => {
    loadNewQuestionRef.current = loadNewQuestion;
  }, [loadNewQuestion]);

  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  useEffect(() => {
    answerQuestionRef.current = answerQuestion;
  }, [answerQuestion]);

  const handleGuess = useCallback(
    async (artistName) => {
      if (timerRef.current) clearInterval(timerRef.current);

      const isCorrect = artistName === correctGuess;

      setFeedbackColor(
        isCorrect ? "rgba(0, 229, 255, 0.2)" : "rgba(255, 82, 82, 0.2)"
      );
      setTimeout(() => setFeedbackColor(null), 500);

      answerQuestion(isCorrect);
      
      // Update multiplayer score if connected
      if (isCorrect && socketService.getSocket()?.connected) {
        socketService.updateScore(1);
      }

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
            // Time's up - handle timeout directly without calling handleGuess to avoid loop
            const isCorrect = false;
            setFeedbackColor("rgba(255, 82, 82, 0.2)");
            setTimeout(() => setFeedbackColor(null), 500);
            // Use refs to access latest values without adding to dependencies
            answerQuestionRef.current(isCorrect);
            if (livesRef.current > 1 && loadNewQuestionRef.current) {
              setTimeout(() => {
                loadNewQuestionRef.current();
              }, 1000);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [songs, startQuestion, config.qtySongs]);

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
        height="60vh"
      >
        <LoadingSpinner />
        <Typography variant="h6" style={{ marginTop: "2rem", color: 'rgba(255,255,255,0.7)' }}>
          LOADING ROUND {round}...
        </Typography>
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <MultiplayerPlayers />
      <BackToLobby />
      <Fade in={!!feedbackColor} timeout={200}>
        <div
          className={classes.feedbackOverlay}
          style={{ backgroundColor: feedbackColor }}
        />
      </Fade>

      <Paper className={classes.header} elevation={0}>
        <Box display="flex" alignItems="center" gap={1}>
            <Typography className={classes.lives}>
            {"❤️".repeat(lives)}
            </Typography>
        </Box>
        <Typography className={classes.round}>ROUND {round}</Typography>
        <Typography className={classes.score}>{score}</Typography>
      </Paper>

      <LinearProgress
        variant="determinate"
        value={(timeLeft / 30) * 100}
        className={classes.timerBar}
        color={timeLeft < 10 ? "secondary" : "primary"}
      />

      <Box className={classes.gameContainer}>
        <Typography variant="h1" className={classes.questionTitle}>
            WHO IS THIS?
        </Typography>

        <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
            <PlayAudiosContainer
            songs={songs}
            previewDuration={config.previewDuration || 30}
            />
        </Box>

        <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
            <GuessChoicesContainer
            artists={artists}
            onGuess={handleGuess}
            correctGuess={correctGuess}
            />
        </Box>

        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={2}
        >
            <Volume />
        </Box>
      </Box>
    </div>
  );
};

export default Guess;
