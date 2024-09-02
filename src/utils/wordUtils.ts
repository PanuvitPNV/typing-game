const words: string[] = ['react', 'javascript', 'typescript', 'component', 'state', 'props', 'hook', 'effect', 'context', 'redux','xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'];

const wordMeanings: { [key: string]: string } = {
  'react': 'A JavaScript library for building user interfaces',
  'javascript': 'A high-level, interpreted programming language',
  'typescript': 'A typed superset of JavaScript that compiles to plain JavaScript',
  'component': 'A reusable piece of UI in React',
  'state': 'An object that holds data in a React component',
  'props': 'Properties passed to a React component',
  'hook': 'Functions that let you use state and other React features without writing a class',
  'effect': 'A Hook for performing side effects in function components',
  'context': 'A way to pass data through the component tree without passing props manually',
  'redux': 'A predictable state container for JavaScript apps',
  'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx': 'A placeholder word',
};

export const getRandomWord = (): string => {
  return words[Math.floor(Math.random() * words.length)];
};

export const getWordMeaning = (word: string): string => {
  return wordMeanings[word] || 'Meaning not available';
};