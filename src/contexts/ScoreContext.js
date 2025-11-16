import React, { createContext, useContext, useState, useEffect } from 'react';

const ScoreContext = createContext();

export const useScore = () => {
    const context = useContext(ScoreContext);
    if (!context) {
        throw new Error('useScore must be used within a ScoreProvider');
    }
    return context;
};

export const ScoreProvider = ({ children }) => {
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [responseTime, setResponseTime] = useState(null);
    const [questionStartTime, setQuestionStartTime] = useState(null);

    // Calculate score based on speed and streak
    const calculateScore = (isCorrect, timeInSeconds) => {
        if (!isCorrect) {
            setStreak(0);
            return 0;
        }

        let points = 100; // Base points for correct answer

        // Speed bonus (max 50 points)
        // < 5 seconds: +50 points
        // < 10 seconds: +30 points
        // < 15 seconds: +20 points
        // < 20 seconds: +10 points
        if (timeInSeconds < 5) {
            points += 50;
        } else if (timeInSeconds < 10) {
            points += 30;
        } else if (timeInSeconds < 15) {
            points += 20;
        } else if (timeInSeconds < 20) {
            points += 10;
        }

        // Streak bonus (10 points per streak)
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak * 10, 100); // Max 100 bonus
        points += streakBonus;

        setStreak(newStreak);
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + points);

        return points;
    };

    const startQuestion = () => {
        setQuestionStartTime(Date.now());
        setTotalQuestions(prev => prev + 1);
    };

    const answerQuestion = (isCorrect) => {
        if (!questionStartTime) {
            console.error('Question was not started properly');
            return 0;
        }

        const timeInSeconds = (Date.now() - questionStartTime) / 1000;
        setResponseTime(timeInSeconds);
        const points = calculateScore(isCorrect, timeInSeconds);
        setQuestionStartTime(null);

        return { points, timeInSeconds };
    };

    const resetScore = () => {
        setScore(0);
        setStreak(0);
        setTotalQuestions(0);
        setCorrectAnswers(0);
        setResponseTime(null);
        setQuestionStartTime(null);
    };

    // Save high score to localStorage
    const saveHighScore = (playerName = 'Anonymous') => {
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        const newScore = {
            name: playerName,
            score: score,
            accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : 0,
            date: new Date().toISOString(),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers
        };

        highScores.push(newScore);
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep only top 10

        localStorage.setItem('highScores', JSON.stringify(highScores));
    };

    const getHighScores = () => {
        return JSON.parse(localStorage.getItem('highScores') || '[]');
    };

    const value = {
        score,
        streak,
        totalQuestions,
        correctAnswers,
        responseTime,
        startQuestion,
        answerQuestion,
        resetScore,
        saveHighScore,
        getHighScores
    };

    return (
        <ScoreContext.Provider value={value}>
            {children}
        </ScoreContext.Provider>
    );
};

export default ScoreContext;
