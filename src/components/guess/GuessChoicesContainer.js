import React from "react";
import GuessChoice from "./GuessChoice";

//used in guess and result
const GuessChoicesContainer = ({artists, setGuess, correctGuess}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
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
        </div>
    );
};

export default GuessChoicesContainer;
