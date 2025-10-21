import { createContext, useContext, useReducer } from 'react';

const CampaignContext = createContext();

const initialState = {
  campaign: null,
  players: [],
  worldData: null,
  tokens: [],
  events: [],
  initiative: [],
  currentTurn: 0
};

function campaignReducer(state, action) {
  switch (action.type) {
    case 'SET_CAMPAIGN':
      return { ...state, campaign: action.payload };
    case 'ADD_PLAYER':
      return { ...state, players: [...state.players, action.payload] };
    case 'SET_WORLD_DATA':
      return { ...state, worldData: action.payload };
    case 'ADD_EVENT':
      return { ...state, events: [action.payload, ...state.events] };
    default:
      return state;
  }
}

export function CampaignProvider({ children }) {
  const [state, dispatch] = useReducer(campaignReducer, initialState);
  return (
    <CampaignContext.Provider value={{ state, dispatch }}>
      {children}
    </CampaignContext.Provider>
  );
}

export const useCampaign = () => useContext(CampaignContext);