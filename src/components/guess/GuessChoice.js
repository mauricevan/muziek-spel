import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Howler } from "howler";
import { useScore } from "../../contexts/ScoreContext";
import { FaCheck } from 'react-icons/fa';

const GuessChoice = ({ artist, setGuess, correctGuess }) => {
    const { answerQuestion } = useScore();
    const [isClicked, setIsClicked] = useState(false);

    const handleGuess = () => {
        if (isClicked) return; // Prevent double clicks

        setIsClicked(true);
        Howler.stop();
        const isCorrect = artist === correctGuess;
        answerQuestion(isCorrect);
        setGuess(artist);
    };

    return (
        <Link
            to="/results"
            onClick={handleGuess}
            className={`block w-full ${isClicked ? 'pointer-events-none' : ''}`}
        >
            <button
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 focus-visible-ring ${
                    isClicked
                        ? 'bg-blue-500 text-white scale-95'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 hover:from-blue-600 hover:to-purple-700'
                }`}
                aria-label={`Guess artist: ${artist}`}
            >
                <div className="flex items-center justify-center gap-2">
                    {isClicked && <FaCheck className="text-xl animate-scale-in" />}
                    <span>{artist}</span>
                </div>
            </button>
        </Link>
    );
};

export default GuessChoice;
