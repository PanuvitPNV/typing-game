import React from 'react';
import { HomeIcon, GamepadIcon } from "lucide-react";
import Home from "./pages/Home";
import Game from "./pages/Game";

interface NavItem {
  title: string;
  to: string;
  icon: React.ReactNode;
  page: React.ReactNode;
}

export const navItems: NavItem[] = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Home />,
  },
  {
    title: "Game",
    to: "/game",
    icon: <GamepadIcon className="h-4 w-4" />,
    page: <Game />,
  },
];