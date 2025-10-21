import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './PlayerActions.module.css';

export default function PlayerActions({ character, onAction, actionEconomy = {} }) {
  const { colors } = useTheme();
  const [selectedAction, setSelectedAction] = useState(null);
  
  const actionTypes = {
    action: {
      icon: '⚔️',
      label: 'Action',
      options: [
        { name: 'Attack', type: 'attack' },
        { name: 'Cast Spell', type: 'spell' },
        { name: 'Dash', type: 'dash' },
        { name: 'Dodge', type: 'dodge' },
        { name: 'Help', type: 'help' }
      ],
      available: actionEconomy.action !== false
    },
    bonusAction: {
      icon: '⚡',
      label: 'Bonus Action',
      options: [
        { name: 'Off-hand Attack', type: 'offhand' },
        { name: 'Quick Spell', type: 'bonusSpell' },
        { name: 'Second Wind', type: 'secondWind' }
      ],
      available: actionEconomy.bonusAction !== false
    },
    movement: {
      icon: '🏃',
      label: 'Movement',
      options: [
        { name: 'Move', type: 'move' },
        { name: 'Disengage', type: 'disengage' }
      ],
      available: actionEconomy.movement !== false
    },
    reaction: {
      icon: '🛡️',
      label: 'Reaction',
      options: [
        { name: 'Opportunity Attack', type: 'opportunity' },
        { name: 'Counterspell', type: 'counterspell' }
      ],
      available: actionEconomy.reaction !== false
    }
  };


  const handleActionSelect = async (type, option) => {
    setSelectedAction({ type, option });
    await onAction(type, option);
    setSelectedAction(null);
  };

  return (
    <div className={styles.container}>
      <div className={styles.actionBar}>
        {Object.entries(actionTypes).map(([type, data]) => (
          <div key={type} className={styles.actionGroup}>
            <button 
              className={`${styles.actionButton} ${!data.available ? styles.disabled : ''}`}
              onClick={() => data.available && setSelectedAction(prev => 
                prev?.type === type ? null : { type }
              )}
              disabled={!data.available}
            >
              <span className={styles.icon}>{data.icon}</span>
              {data.label}
              {!data.available && <span className={styles.used}>USED</span>}
            </button>
            
            {selectedAction?.type === type && data.available && (
              <div className={styles.optionsPanel}>
                {data.options.map(option => (
                  <button
                    key={option.name || option}
                    className={styles.optionButton}
                    onClick={() => handleActionSelect(type, option)}
                  >
                    {option.name || option}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
