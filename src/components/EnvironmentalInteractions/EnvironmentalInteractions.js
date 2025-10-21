import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './EnvironmentalInteractions.module.css';

export default function EnvironmentalInteractions({ 
  environmentalObjects, 
  onInteract, 
  onAddObject, 
  onRemoveObject,
  isDM = false 
}) {
  const { colors } = useTheme();
  const [selectedObject, setSelectedObject] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const objectTypes = {
    chest: { icon: '📦', label: 'Chest', description: 'May contain treasure or traps' },
    door: { icon: '🚪', label: 'Door', description: 'Can be opened, locked, or barred' },
    lever: { icon: '🎛️', label: 'Lever', description: 'Activates mechanisms or traps' },
    fire: { icon: '🔥', label: 'Fire', description: 'Deals fire damage to those who touch it' },
    acid: { icon: '🧪', label: 'Acid Pool', description: 'Deals acid damage to those who enter' },
    barrel: { icon: '🛢️', label: 'Barrel', description: 'Can be pushed, broken, or used as cover' },
    pillar: { icon: '🏛️', label: 'Pillar', description: 'Provides cover and can be climbed' },
    trap: { icon: '⚠️', label: 'Trap', description: 'Hidden danger that triggers when stepped on' },
    altar: { icon: '⛩️', label: 'Altar', description: 'Sacred site for rituals or blessings' },
    fountain: { icon: '⛲', label: 'Fountain', description: 'Magical water source with healing properties' }
  };

  const interactionTypes = {
    chest: ['Open', 'Examine', 'Disarm Trap', 'Force Open'],
    door: ['Open', 'Close', 'Lock', 'Unlock', 'Bar', 'Break Down'],
    lever: ['Pull', 'Examine', 'Disarm'],
    fire: ['Extinguish', 'Feed', 'Use as Weapon'],
    acid: ['Avoid', 'Test', 'Neutralize'],
    barrel: ['Push', 'Break', 'Hide Behind', 'Examine'],
    pillar: ['Climb', 'Hide Behind', 'Examine'],
    trap: ['Disarm', 'Trigger', 'Examine'],
    altar: ['Pray', 'Make Offering', 'Examine', 'Desecrate'],
    fountain: ['Drink', 'Fill Container', 'Examine', 'Bless']
  };

  const handleInteraction = (object, interaction) => {
    onInteract(object, interaction);
    setSelectedObject(null);
  };

  const handleAddObject = (type, x, y) => {
    const newObject = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      properties: {
        locked: false,
        trapped: false,
        magical: false,
        condition: 'good'
      }
    };
    onAddObject(newObject);
    setShowAddMenu(false);
  };

  const getObjectAtPosition = (x, y) => {
    return environmentalObjects.find(obj => obj.x === x && obj.y === y);
  };

  const getObjectIcon = (type) => {
    return objectTypes[type]?.icon || '📦';
  };

  const getObjectLabel = (type) => {
    return objectTypes[type]?.label || 'Unknown Object';
  };

  const getObjectDescription = (type) => {
    return objectTypes[type]?.description || 'An unknown object';
  };

  const getInteractions = (type) => {
    return interactionTypes[type] || ['Examine'];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Environmental Objects</h3>
        {isDM && (
          <button 
            className={styles.addButton}
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            Add Object
          </button>
        )}
      </div>

      {/* Object List */}
      <div className={styles.objectList}>
        {environmentalObjects.length === 0 ? (
          <div className={styles.empty}>
            <p>No environmental objects placed</p>
            {isDM && <p>Click "Add Object" to place objects on the board</p>}
          </div>
        ) : (
          environmentalObjects.map((object, index) => (
            <div 
              key={object.id || index}
              className={styles.objectItem}
              onClick={() => setSelectedObject(object)}
            >
              <span className={styles.objectIcon}>{getObjectIcon(object.type)}</span>
              <div className={styles.objectInfo}>
                <span className={styles.objectName}>{getObjectLabel(object.type)}</span>
                <span className={styles.objectPosition}>({object.x}, {object.y})</span>
              </div>
              {isDM && (
                <button 
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveObject(object.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Object Menu */}
      {showAddMenu && (
        <div className={styles.addMenu}>
          <h4>Add Environmental Object</h4>
          <div className={styles.objectGrid}>
            {Object.entries(objectTypes).map(([type, data]) => (
              <button
                key={type}
                className={styles.objectTypeButton}
                onClick={() => handleAddObject(type, 0, 0)} // Position will be set by DM
                title={data.description}
              >
                <span className={styles.objectIcon}>{data.icon}</span>
                <span className={styles.objectLabel}>{data.label}</span>
              </button>
            ))}
          </div>
          <button 
            className={styles.cancelButton}
            onClick={() => setShowAddMenu(false)}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Interaction Modal */}
      {selectedObject && (
        <div className={styles.modal} onClick={() => setSelectedObject(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>
                <span className={styles.objectIcon}>{getObjectIcon(selectedObject.type)}</span>
                {getObjectLabel(selectedObject.type)}
              </h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedObject(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.objectDetails}>
              <p className={styles.objectDescription}>
                {getObjectDescription(selectedObject.type)}
              </p>
              
              <div className={styles.objectProperties}>
                <h4>Properties</h4>
                <div className={styles.propertyList}>
                  <div className={styles.property}>
                    <span className={styles.propertyLabel}>Position:</span>
                    <span className={styles.propertyValue}>({selectedObject.x}, {selectedObject.y})</span>
                  </div>
                  {selectedObject.properties && Object.entries(selectedObject.properties).map(([key, value]) => (
                    <div key={key} className={styles.property}>
                      <span className={styles.propertyLabel}>{key}:</span>
                      <span className={styles.propertyValue}>{value.toString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.interactions}>
                <h4>Available Interactions</h4>
                <div className={styles.interactionList}>
                  {getInteractions(selectedObject.type).map((interaction, index) => (
                    <button
                      key={index}
                      className={styles.interactionButton}
                      onClick={() => handleInteraction(selectedObject, interaction)}
                    >
                      {interaction}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

