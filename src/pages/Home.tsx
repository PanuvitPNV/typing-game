import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Home: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = document.cookie.replace(/(?:(?:^|.*;\s*)playerName\s*=\s*([^;]*).*$)|^.*$/, "$1");
    if (storedName) setPlayerName(storedName);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      document.cookie = `playerName=${playerName}; max-age=31536000; path=/`;
      navigate('/game');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to Speed Typer</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Play
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Home;