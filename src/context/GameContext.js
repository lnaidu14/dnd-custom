import { createContext, useContext, useReducer } from 'react';

const GameContext = createContext();

const initialState = {
  screen: 'home',
  campaign: null,
  player: null,
  board: {
    tokens: [],
    grid: [],
    initiative: []
  },
  events: []
};

// Remove individual component state and use this context instead