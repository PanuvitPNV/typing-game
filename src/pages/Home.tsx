import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Scoreboard from '../components/Scoreboard';

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem('playerName');
    if (storedName) setPlayerName(storedName);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem('playerName', playerName);
      navigate('/game');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg mb-8">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Speed Typer</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
            className="w-full text-lg"
          />
          <Button type="submit" className="w-full text-lg">
            Play
          </Button>
        </form>
      </div>
      <Scoreboard className="w-full max-w-md" />
    </div>
  );
};

export default Home;