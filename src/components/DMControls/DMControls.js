import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './DMControls.module.css';

export default function DMControls({ campaign, onAction }) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('npcs');

  const tabs = [
    { id: 'npcs', label: 'NPCs' },
    { id: 'combat', label: 'Combat' },
    { id: 'environment', label: 'Environment' },
    { id: 'music', label: 'Music' }
  ];

  return (
    <div className={styles.controls}>
      <div className={styles.tabs}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'npcs' && (
          <div className={styles.npcList}>
            {campaign.npcs.map(npc => (
              <div key={npc.id} className={styles.npc}>
                <img src={npc.portrait} alt={npc.name} />
                <div className={styles.npcInfo}>
                  <h3>{npc.name}</h3>
                  <p>{npc.role}</p>
                </div>
                <button onClick={() => onAction('spawnNPC', npc)}>
                  Spawn
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'combat' && (
          <div className={styles.combatControls}>
            <button onClick={() => onAction('startCombat')}>
              Start Combat
            </button>
            <button onClick={() => onAction('rollInitiative')}>
              Roll Initiative
            </button>
          </div>
        )}
      </div>
    </div>
  );
}