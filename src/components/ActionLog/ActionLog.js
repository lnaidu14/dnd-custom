import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './ActionLog.module.css';

export default function ActionLog({ events }) {
  const { colors } = useTheme();
  const logRef = useRef(null);

  const getEventStyle = (type) => {
    const styles = {
      combat: { color: colors.combat, icon: '⚔️' },
      spell: { color: colors.magic, icon: '✨' },
      skill: { color: colors.skill, icon: '🎯' },
      roleplay: { color: colors.roleplay, icon: '🎭' }
    };
    return styles[type] || { color: colors.text, icon: '📝' };
  };

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Action Log</h3>
      <div ref={logRef} className={styles.log}>
        {events.map((event, index) => {
          const { color, icon } = getEventStyle(event.type);
          return (
            <div 
              key={index}
              className={styles.event}
              style={{ '--event-color': color }}
            >
              <span className={styles.icon}>{icon}</span>
              <span className={styles.time}>
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
              <p className={styles.message}>{event.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
