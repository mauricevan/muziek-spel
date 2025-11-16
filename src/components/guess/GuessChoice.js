import React from "react";
import Button from "@material-ui/core/Button";

import { Link } from "react-router-dom";
import { Howler } from "howler";
import { useScore } from "../../contexts/ScoreContext";

const GuessChoice = ({ artist, setGuess, correctGuess }) => {
    const { answerQuestion } = useScore();

    const handleGuess = () => {
        Howler.stop();
        const isCorrect = artist === correctGuess;
        answerQuestion(isCorrect);
        setGuess(artist);
    };

    return (
        <Button
            component={Link}
            to="/results"
            onClick={handleGuess}
            variant="contained"
            color="primary"
            style={{ width: "100%", textAlign: "center" }}
        >
            {artist}
        </Button>
    );
};

export default GuessChoice;
