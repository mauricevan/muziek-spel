import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PlayAudiosContainer from "./guess/PlayAudiosContainer";
import GuessChoicesContainer from "./guess/GuessChoicesContainer";
import Volume from "./guess/Volume";
import { useScore } from "../contexts/ScoreContext";
import { FaArrowLeft, FaMusic } from 'react-icons/fa';

const Guess = ({ config, artists, songs, setGuess, correctGuess }) => {
  const { startQuestion } = useScore();
  const [isLoading, setIsLoading] = useState(true);
  const darkMode = localStorage.getItem("darkMode") === "true";

  useEffect(() => {
    // Apply dark mode
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (songs?.length === config.qtySongs) {
      // Start timing when the question is fully loaded
      startQuestion();
      setIsLoading(false);
    }
  }, [songs, config.qtySongs]);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="shimmer h-12 rounded-lg mb-8 w-3/4 mx-auto" />

        {/* Audio Players Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer h-32 rounded-xl" />
          ))}
        </div>

        {/* Volume Skeleton */}
        <div className="shimmer h-16 rounded-lg mb-8 w-1/2 mx-auto" />

        {/* Choices Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="shimmer h-20 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6 animate-slide-down">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible-ring"
            aria-label="Terug naar home"
          >
            <FaArrowLeft />
            <span className="font-semibold">Terug naar Home</span>
          </Link>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="animate-scale-in">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                <span className="text-gradient">Welke artiest is dit?</span> 🎵
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Luister goed en kies het juiste antwoord!
              </p>
            </div>

            {/* Audio Players Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 mb-8">
              <div className="flex items-center justify-center gap-2 mb-6">
                <FaMusic className="text-blue-500 text-2xl animate-pulse" />
                <h2 className="text-2xl font-bold dark:text-white">Muziek Previews</h2>
              </div>
              <PlayAudiosContainer
                songs={songs}
                previewDuration={config.previewDuration || 30}
              />
            </div>

            {/* Volume Control */}
            {songs && (
              <div className="flex justify-center mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md">
                  <Volume />
                </div>
              </div>
            )}

            {/* Artist Choices */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6 text-center dark:text-white">
                Kies de juiste artiest
              </h2>
              {artists && (
                <GuessChoicesContainer
                  artists={artists}
                  setGuess={setGuess}
                  correctGuess={correctGuess}
                />
              )}
            </div>

            {/* Tips */}
            <div className="mt-8 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
              <p className="text-center text-gray-700 dark:text-gray-300">
                <strong>💡 Tip:</strong> Sneller raden = meer punten! ⚡
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Guess;
