import React from "react";
import Button from "@material-ui/core/Button";

const GuessChoice = ({ artist, onGuess }) => {
    return (
        <Button
            onClick={() => onGuess(artist)}
            variant="contained"
            color="primary"
            style={{ width: "100%", textAlign: "center" }}
        >
            {artist}
        </Button>
    );
};

export default GuessChoice;
