import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ResultsContainer from "./result/ResultsContainer";
import { useScore } from "../contexts/ScoreContext";
import confetti from 'canvas-confetti';
import { FaHome, FaTrophy, FaChartLine, FaRedo, FaArrowLeft } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const Results = ({ artists, correctGuess, guess }) => {
    const { score, streak, totalQuestions, correctAnswers, saveHighScore, getHighScores } = useScore();
    const [highScores, setHighScores] = useState([]);
    const [playerName, setPlayerName] = useState('');
    const [scoreSaved, setScoreSaved] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const darkMode = localStorage.getItem("darkMode") === "true";

    const isCorrect = correctGuess === guess;
    const accuracy = totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).toFixed(1) : 0;

    useEffect(() => {
        // Apply dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        setHighScores(getHighScores());

        // Fire confetti if correct
        if (isCorrect) {
            setShowConfetti(true);
            fireConfetti();
        }
    }, [darkMode, isCorrect]);

    const fireConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Fire from left and right
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);

        // Extra burst for high scores
        if (score > 150) {
            setTimeout(() => {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }, 500);
        }
    };

    const handleSaveScore = () => {
        if (playerName.trim()) {
            saveHighScore(playerName);
            setHighScores(getHighScores());
            setScoreSaved(true);
            toast.success('Score opgeslagen! 🎉');
        } else {
            toast.error('Vul een naam in om je score op te slaan!');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4 sm:p-8">
            <Toaster position="top-center" />

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

                {/* Result Header */}
                <div className="text-center mb-8 animate-scale-in">
                    <h1 className="text-5xl sm:text-6xl font-bold mb-4">
                        {isCorrect ? (
                            <span className="text-gradient">Goed gedaan! 🎉</span>
                        ) : (
                            <span className="text-gradient">Volgende keer beter! 💪</span>
                        )}
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        {isCorrect ? 'Fantastisch! Je hebt het juiste antwoord gekozen!' : 'Niet getreurd, blijf oefenen!'}
                    </p>
                </div>

                {/* Score Card */}
                <div className={`bg-gradient-to-br ${
                    isCorrect
                        ? 'from-green-50 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30'
                        : 'from-red-50 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30'
                } rounded-3xl shadow-2xl p-8 mb-8 animate-slide-up`}>
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <FaTrophy className="text-yellow-500 text-5xl" />
                            <h2 className="text-4xl font-bold dark:text-white">Score: {score} punten</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6">
                                <div className="text-3xl mb-2">🔥</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Streak</div>
                                <div className="text-2xl font-bold dark:text-white">{streak}</div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6">
                                <div className="text-3xl mb-2">✅</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
                                <div className="text-2xl font-bold dark:text-white">
                                    {correctAnswers} / {totalQuestions}
                                </div>
                            </div>
                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6">
                                <div className="text-3xl mb-2">📊</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Nauwkeurigheid</div>
                                <div className="text-2xl font-bold dark:text-white">{accuracy}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Artist Results */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in">
                    <ResultsContainer
                        artists={artists}
                        correctGuess={correctGuess}
                        guess={guess}
                    />
                </div>

                {/* Save Score Section */}
                {!scoreSaved && score > 0 && (
                    <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl shadow-2xl p-8 text-white mb-8 animate-scale-in">
                        <h3 className="text-2xl font-bold mb-4 text-center">💾 Sla je score op!</h3>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                            <input
                                type="text"
                                placeholder="Je naam"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveScore()}
                                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
                                aria-label="Enter your name"
                            />
                            <button
                                onClick={handleSaveScore}
                                className="bg-white text-purple-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-visible-ring"
                            >
                                Opslaan
                            </button>
                        </div>
                    </div>
                )}

                {/* Leaderboard */}
                {highScores.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 animate-fade-in">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <FaChartLine className="text-blue-500 text-3xl" />
                            <h2 className="text-3xl font-bold dark:text-white">🏆 Top 10 High Scores</h2>
                        </div>
                        <div className="space-y-3">
                            {highScores.map((score, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-102 ${
                                        index === 0
                                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900'
                                            : index === 1
                                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                                            : index === 2
                                            ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl font-bold min-w-[2rem]">
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </span>
                                        <span className="font-semibold">{score.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-xl">{score.score} pts</p>
                                        <p className="text-sm opacity-75">{score.accuracy}% nauwkeurig</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link to="/" className="w-full sm:w-auto">
                        <button className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
                            <FaHome />
                            <span>Terug naar Home</span>
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Results;
