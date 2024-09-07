import { useState, useEffect } from 'react';

export type DifficultyLevel = 'easy' | 'normal' | 'hard';
export type ColorScheme = 'light' | 'dark' | 'system';

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>('system');

  useEffect(() => {
    const savedScheme = localStorage.getItem('colorScheme') as ColorScheme;
    if (savedScheme) setColorScheme(savedScheme);
  }, []);

  const updateColorScheme = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    localStorage.setItem('colorScheme', newScheme);
  };

  return { colorScheme, updateColorScheme };
};

export const gameConfig = {
  TIME_DECREASE_RATE: {
    easy: 0.3,
    normal: 0.5,
    hard: 0.7,
  },
  TIME_INCREASE_PER_WORD: {
    easy: 2,
    normal: 1.5,
    hard: 1,
  },
  WRONG_CHARACTER_PENALTY: {
    easy: 0.5,
    normal: 0.7,
    hard: 0.9,
  },
};