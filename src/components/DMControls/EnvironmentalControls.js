import { useState } from 'react';
import styles from './EnvironmentalControls.module.css';

const ENVIRONMENTAL_OBJECTS = [
  { id: 'tree', name: 'Tree', icon: '🌳', type: 'obstacle' },
  { id: 'rock', name: 'Rock', icon: '🪨', type: 'obstacle' },
  { id: 'chest', name: 'Chest', icon: '📦', type: 'container' },
  { id: 'door', name: 'Door', icon: '🚪', type: 'interactive' },
  { id: 'fire', name: 'Fire', icon: '🔥', type: 'hazard' },
  { id: 'water', name: 'Water', icon: '💧', type: 'terrain' },
  { id: 'trap', name: 'Trap', icon: '⚠️', type: 'hazard' },
  { id: 'altar', name: 'Altar', icon: '⛩️', type: 'interactive' }
];

const ELEVATION_LEVELS = [
  { value: 0, label: 'Ground Level' },
  { value: 5, label: 'Low (+5ft)' },
  { value: 10, label: 'Medium (+10ft)' },
  { value: 15, label: 'High (+15ft)' },
  { value: 20, label: 'Very High (+20ft)' }
];

const COVER_TYPES = [
  { value: 'none', label: 'No Cover' },
  { value: 'half', label: 'Half Cover (+2 AC)' },
  { value: 'three-quarters', label: '3/4 Cover (+5 AC)' },
  { value: 'total', label: 'Total Cover' }
];

export default function EnvironmentalControls({ 
  onAddObject, 
  onSetElevation, 
  onSetCover 
}) {
  const [selectedElevation, setSelectedElevation] = useState(0);
  const [selectedCover, setSelectedCover] = useState('none');

  const handleObjectClick = (object) => {
    if (onAddObject) {
      onAddObject(object.type, {
        name: object.name,
        icon: object.icon,
        type: object.type,
        id: object.id
      });
    }
  };

  const handleElevationChange = (elevation) => {
    setSelectedElevation(elevation);
    if (onSetElevation) {
      onSetElevation(elevation);
    }
  };

  const handleCoverChange = (cover) => {
    setSelectedCover(cover);
    if (onSetCover) {
      onSetCover(cover);
    }
  };

  return (
    <div className={styles.container}>
      <h3>Environmental Controls</h3>
      
      {/* Environmental Objects */}
      <div className={styles.section}>
        <h4>Environmental Objects</h4>
        <div className={styles.objectGrid}>
          {ENVIRONMENTAL_OBJECTS.map((object) => (
            <button
              key={object.id}
              className={styles.objectButton}
              onClick={() => handleObjectClick(object)}
              title={`Add ${object.name}`}
            >
              <span className={styles.objectIcon}>{object.icon}</span>
              <span className={styles.objectName}>{object.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Elevation Controls */}
      <div className={styles.section}>
        <h4>Elevation</h4>
        <div className={styles.elevationControls}>
          {ELEVATION_LEVELS.map((level) => (
            <button
              key={level.value}
              className={`${styles.elevationButton} ${
                selectedElevation === level.value ? styles.active : ''
              }`}
              onClick={() => handleElevationChange(level.value)}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cover Controls */}
      <div className={styles.section}>
        <h4>Cover & Concealment</h4>
        <div className={styles.coverControls}>
          {COVER_TYPES.map((cover) => (
            <button
              key={cover.value}
              className={`${styles.coverButton} ${
                selectedCover === cover.value ? styles.active : ''
              }`}
              onClick={() => handleCoverChange(cover.value)}
            >
              {cover.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.section}>
        <h4>Quick Actions</h4>
        <div className={styles.quickActions}>
          <button 
            className={styles.actionButton}
            onClick={() => handleObjectClick({ type: 'light', name: 'Light Source', icon: '💡' })}
          >
            💡 Add Light
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleObjectClick({ type: 'darkness', name: 'Darkness', icon: '🌑' })}
          >
            🌑 Add Darkness
          </button>
          <button 
            className={styles.actionButton}
            onClick={() => handleObjectClick({ type: 'difficult', name: 'Difficult Terrain', icon: '🌿' })}
          >
            🌿 Difficult Terrain
          </button>
        </div>
      </div>
    </div>
  );
}
