import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import type { ScoreContextType, HighScore } from '../types/game.types';

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export const useScore = (): ScoreContextType => {
    const context = useContext(ScoreContext);
    if (!context) {
        throw new Error('useScore must be used within a ScoreProvider');
    }
    return context;
};

interface ScoreProviderProps {
    children: ReactNode;
}

export const ScoreProvider: React.FC<ScoreProviderProps> = ({ children }) => {
    const [score, setScore] = useState<number>(0);
    const [streak, setStreak] = useState<number>(0);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [correctAnswers, setCorrectAnswers] = useState<number>(0);
    const [responseTime, setResponseTime] = useState<number | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number | null>(null);
    
    // Arcade Mode State
    const [lives, setLives] = useState<number>(3);
    const [round, setRound] = useState<number>(1);
    const [gameOver, setGameOver] = useState<boolean>(false);

    // Calculate score based on speed and streak
    const calculateScore = useCallback((isCorrect: boolean, timeInSeconds: number): number => {
        if (!isCorrect) {
            setStreak(0);
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                }
                return newLives;
            });
            return 0;
        }

        let points = 100; // Base points for correct answer

        // Speed bonus (max 50 points)
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
        // We use the current streak from state + 1
        // Note: This relies on 'streak' being up to date in the closure
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak * 10, 100); // Max 100 bonus
        points += streakBonus;

        setStreak(newStreak);
        setCorrectAnswers(prev => prev + 1);
        setScore(prev => prev + points);
        setRound(prev => prev + 1);

        return points;
    }, [streak]);

    const startQuestion = useCallback((): void => {
        setQuestionStartTime(Date.now());
        setTotalQuestions(prev => prev + 1);
    }, []);

    const answerQuestion = useCallback((isCorrect: boolean): { points: number; timeInSeconds: number } => {
        if (!questionStartTime) {
            console.error('Question was not started properly');
            return { points: 0, timeInSeconds: 0 };
        }

        const timeInSeconds = (Date.now() - questionStartTime) / 1000;
        setResponseTime(timeInSeconds);
        const points = calculateScore(isCorrect, timeInSeconds);
        setQuestionStartTime(null);

        return { points, timeInSeconds };
    }, [questionStartTime, calculateScore]);

    const resetGame = useCallback((): void => {
        setScore(0);
        setStreak(0);
        setTotalQuestions(0);
        setCorrectAnswers(0);
        setResponseTime(null);
        setQuestionStartTime(null);
        setLives(3);
        setRound(1);
        setGameOver(false);
    }, []);

    // Memoize accuracy calculation
    const accuracy = useMemo(() => {
        return totalQuestions > 0 ? (correctAnswers / totalQuestions * 100).toFixed(1) : '0';
    }, [totalQuestions, correctAnswers]);

    // Save high score to localStorage
    const saveHighScore = useCallback((playerName: string = 'Anonymous'): void => {
        const highScores: HighScore[] = JSON.parse(localStorage.getItem('highScores') || '[]');
        const newScore: HighScore = {
            name: playerName,
            score: score,
            accuracy: accuracy,
            date: new Date().toISOString(),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            rounds: round
        };

        highScores.push(newScore);
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep only top 10

        localStorage.setItem('highScores', JSON.stringify(highScores));
    }, [score, totalQuestions, correctAnswers, round, accuracy]);

    const getHighScores = useCallback((): HighScore[] => {
        return JSON.parse(localStorage.getItem('highScores') || '[]');
    }, []);

    const value: ScoreContextType = {
        score,
        streak,
        totalQuestions,
        correctAnswers,
        responseTime,
        lives,
        round,
        gameOver,
        startQuestion,
        answerQuestion,
        resetGame,
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

