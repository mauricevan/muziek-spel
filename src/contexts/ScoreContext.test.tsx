import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { ScoreProvider, useScore } from './ScoreContext';

// Test component that uses the hook
const TestComponent: React.FC = () => {
  const context = useScore();
  return (
    <div>
      <span data-testid="score">{context.score}</span>
      <span data-testid="streak">{context.streak}</span>
      <span data-testid="totalQuestions">{context.totalQuestions}</span>
      <span data-testid="correctAnswers">{context.correctAnswers}</span>
      <span data-testid="lives">{context.lives}</span>
      <span data-testid="round">{context.round}</span>
      <span data-testid="gameOver">{context.gameOver.toString()}</span>
      <button data-testid="startQuestion" onClick={context.startQuestion}>Start</button>
      <button data-testid="answerCorrect" onClick={() => context.answerQuestion(true)}>Correct</button>
      <button data-testid="answerIncorrect" onClick={() => context.answerQuestion(false)}>Incorrect</button>
      <button data-testid="resetGame" onClick={context.resetGame}>Reset</button>
      <button data-testid="saveHighScore" onClick={() => context.saveHighScore('TestPlayer')}>Save</button>
    </div>
  );
};

describe('ScoreContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it('should provide initial score values', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('streak').textContent).toBe('0');
    expect(screen.getByTestId('totalQuestions').textContent).toBe('0');
    expect(screen.getByTestId('correctAnswers').textContent).toBe('0');
    expect(screen.getByTestId('lives').textContent).toBe('3');
    expect(screen.getByTestId('round').textContent).toBe('1');
    expect(screen.getByTestId('gameOver').textContent).toBe('false');
  });

  it('should start a question', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    act(() => {
      screen.getByTestId('startQuestion').click();
    });

    expect(screen.getByTestId('totalQuestions').textContent).toBe('1');
  });

  it('should calculate score for correct answer', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    act(() => {
      screen.getByTestId('startQuestion').click();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      screen.getByTestId('answerCorrect').click();
    });

    expect(Number(screen.getByTestId('score').textContent)).toBeGreaterThan(0);
    expect(Number(screen.getByTestId('streak').textContent)).toBeGreaterThan(0);
    expect(screen.getByTestId('correctAnswers').textContent).toBe('1');
  });

  it('should handle incorrect answer', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    act(() => {
      screen.getByTestId('startQuestion').click();
    });

    act(() => {
      screen.getByTestId('answerIncorrect').click();
    });

    expect(screen.getByTestId('streak').textContent).toBe('0');
    expect(screen.getByTestId('lives').textContent).toBe('2');
  });

  it('should reset game', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    act(() => {
      screen.getByTestId('startQuestion').click();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      screen.getByTestId('answerCorrect').click();
    });

    expect(Number(screen.getByTestId('score').textContent)).toBeGreaterThan(0);

    act(() => {
      screen.getByTestId('resetGame').click();
    });

    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('streak').textContent).toBe('0');
    expect(screen.getByTestId('totalQuestions').textContent).toBe('0');
    expect(screen.getByTestId('lives').textContent).toBe('3');
  });

  it('should save high scores', () => {
    render(
      <ScoreProvider>
        <TestComponent />
      </ScoreProvider>
    );

    act(() => {
      screen.getByTestId('startQuestion').click();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      screen.getByTestId('answerCorrect').click();
    });

    // Verify score was updated before saving
    expect(Number(screen.getByTestId('score').textContent)).toBeGreaterThan(0);

    act(() => {
      screen.getByTestId('saveHighScore').click();
    });

    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    expect(highScores).toHaveLength(1);
    expect(highScores[0].name).toBe('TestPlayer');
    expect(highScores[0].score).toBeGreaterThan(0);
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useScore must be used within a ScoreProvider');

    consoleSpy.mockRestore();
  });
});

