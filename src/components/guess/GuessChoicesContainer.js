import React from "react";
import GuessChoice from "./GuessChoice";
import Box from "@material-ui/core/Box";

//used in guess and result
const GuessChoicesContainer = ({artists, setGuess, correctGuess}) => {
    return (
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexDirection="column"
          style={{gap: "1rem"}}
        >
          {artists.map((artist, index) => (
            artist && (
              <GuessChoice
                key={index}
                artist={artist.name}
                setGuess={setGuess}
                correctGuess={correctGuess}
              />
            )
          ))}
        </Box>
    );
};

export default GuessChoicesContainer;
