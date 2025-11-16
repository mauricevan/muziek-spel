import React, { useEffect } from "react";
import Box from "@material-ui/core/Box";
import PlayAudiosContainer from "./guess/PlayAudiosContainer";
import GuessChoicesContainer from "./guess/GuessChoicesContainer";
import Volume from "./guess/Volume";
import LoadingSpinner from "./shared/LoadingSpinner";
import { useScore } from "../contexts/ScoreContext";

const Guess = ({ config, artists, songs, setGuess, correctGuess }) => {
  const { startQuestion } = useScore();

  useEffect(() => {
    if (songs?.length === config.qtySongs) {
      // Start timing when the question is fully loaded
      startQuestion();
    }
  }, [songs, config.qtySongs]);

  return (
    <div>
      {songs?.length !== config.qtySongs &&(
        <LoadingSpinner />
      )}
      {songs?.length === config.qtySongs && (
        <>
          <h1 style={{ textAlign: "center" }}>Welke artiest is dit? 🎵</h1>
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
            {songs && <Volume />}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center">
            {artists && (
              <GuessChoicesContainer
                artists={artists}
                setGuess={setGuess}
                correctGuess={correctGuess}
              />
            )}
          </Box>
        </>
      )}
    </div>
  );
};

export default Guess;
