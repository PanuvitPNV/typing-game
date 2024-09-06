import axios from 'axios';

export const fetchAllWords = async (): Promise<string[]> => {
  try {
    const response = await axios.get('https://random-word-api.herokuapp.com/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
};

export const fetchWordMeaning = async (word: string): Promise<string> => {
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    return response.data[0].meanings[0].definitions[0].definition;
  } catch (error) {
    console.error('Error fetching word meaning:', error);
    return 'Meaning not available';
  }
};