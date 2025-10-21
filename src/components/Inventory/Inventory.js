import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Inventory.module.css';

export default function Inventory({ character, onUpdate, onGenerateItem }) {
  const { colors } = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemGenerator, setShowItemGenerator] = useState(false);
  const [itemPrompt, setItemPrompt] = useState('');

  const itemRarities = {
    common: { color: '#9CA3AF', label: 'Common' },
    uncommon: { color: '#10B981', label: 'Uncommon' },
    rare: { color: '#3B82F6', label: 'Rare' },
    epic: { color: '#8B5CF6', label: 'Epic' },
    legendary: { color: '#F59E0B', label: 'Legendary' }
  };

  const itemTypes = {
    weapon: '⚔️',
    armor: '🛡️',
    accessory: '💍',
    potion: '🧪',
    scroll: '📜',
    tool: '🔧',
    misc: '📦'
  };

  const handleEquipItem = (item) => {
    if (!character || !item) return;

    const updatedCharacter = { ...character };
    
    // Unequip current item in slot
    if (updatedCharacter.equipment?.[item.slot]) {
      const unequippedItem = updatedCharacter.equipment[item.slot];
      updatedCharacter.inventory = [...(updatedCharacter.inventory || []), unequippedItem];
    }

    // Equip new item
    updatedCharacter.equipment = {
      ...updatedCharacter.equipment,
      [item.slot]: item
    };

    // Remove from inventory
    updatedCharacter.inventory = (updatedCharacter.inventory || []).filter(i => i.id !== item.id);

    onUpdate(updatedCharacter);
  };

  const handleUnequipItem = (slot) => {
    if (!character || !character.equipment?.[slot]) return;

    const updatedCharacter = { ...character };
    const unequippedItem = updatedCharacter.equipment[slot];
    
    updatedCharacter.inventory = [...(updatedCharacter.inventory || []), unequippedItem];
    delete updatedCharacter.equipment[slot];

    onUpdate(updatedCharacter);
  };

  const handleGenerateItem = async () => {
    if (!itemPrompt.trim()) return;

    try {
      const generatedItem = await onGenerateItem(itemPrompt);
      if (generatedItem) {
        const updatedCharacter = { ...character };
        updatedCharacter.inventory = [...(updatedCharacter.inventory || []), generatedItem];
        onUpdate(updatedCharacter);
        setItemPrompt('');
        setShowItemGenerator(false);
      }
    } catch (error) {
      console.error('Failed to generate item:', error);
    }
  };

  const getItemStats = (item) => {
    if (!item.stats) return null;
    
    return Object.entries(item.stats).map(([stat, value]) => (
      <div key={stat} className={styles.statLine}>
        <span className={styles.statName}>{stat}:</span>
        <span className={styles.statValue}>+{value}</span>
      </div>
    ));
  };

  if (!character) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h3>No Character Selected</h3>
          <p>Select a character to view their inventory</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Inventory</h3>
        <button 
          className={styles.generateButton}
          onClick={() => setShowItemGenerator(true)}
        >
          Generate Item
        </button>
      </div>

      {/* Equipment Slots */}
      <div className={styles.section}>
        <h4>Equipment</h4>
        <div className={styles.equipmentGrid}>
          {['mainHand', 'offHand', 'head', 'chest', 'hands', 'legs', 'feet'].map(slot => {
            const item = character.equipment?.[slot];
            return (
              <div key={slot} className={styles.equipmentSlot}>
                <label className={styles.slotLabel}>{slot.replace(/([A-Z])/g, ' $1').trim()}</label>
                {item ? (
                  <div 
                    className={styles.equippedItem}
                    onClick={() => setSelectedItem(item)}
                    style={{ borderColor: itemRarities[item.rarity]?.color }}
                  >
                    <span className={styles.itemIcon}>{itemTypes[item.type] || '📦'}</span>
                    <span className={styles.itemName}>{item.name}</span>
                    <button 
                      className={styles.unequipButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnequipItem(slot);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className={styles.emptySlot}>
                    <span className={styles.emptyText}>Empty</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory */}
      <div className={styles.section}>
        <h4>Inventory ({character.inventory?.length || 0}/30)</h4>
        <div className={styles.inventoryGrid}>
          {(character.inventory || []).map((item, index) => (
            <div 
              key={item.id || index}
              className={styles.inventoryItem}
              onClick={() => setSelectedItem(item)}
              style={{ borderColor: itemRarities[item.rarity]?.color }}
            >
              <span className={styles.itemIcon}>{itemTypes[item.type] || '📦'}</span>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemRarity} style={{ color: itemRarities[item.rarity]?.color }}>
                {itemRarities[item.rarity]?.label}
              </span>
              {item.slot && (
                <button 
                  className={styles.equipButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEquipItem(item);
                  }}
                >
                  Equip
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Item Details Modal */}
      {selectedItem && (
        <div className={styles.modal} onClick={() => setSelectedItem(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{selectedItem.name}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedItem(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.itemDetails}>
              <div className={styles.itemInfo}>
                <div className={styles.itemType}>
                  <span className={styles.itemIcon}>{itemTypes[selectedItem.type] || '📦'}</span>
                  <span>{selectedItem.type} • {itemRarities[selectedItem.rarity]?.label}</span>
                </div>
                
                {selectedItem.description && (
                  <p className={styles.itemDescription}>{selectedItem.description}</p>
                )}
                
                {selectedItem.stats && (
                  <div className={styles.itemStats}>
                    <h4>Stats</h4>
                    {getItemStats(selectedItem)}
                  </div>
                )}
                
                {selectedItem.effects && (
                  <div className={styles.itemEffects}>
                    <h4>Effects</h4>
                    {selectedItem.effects.map((effect, index) => (
                      <div key={index} className={styles.effect}>
                        {effect}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Generator Modal */}
      {showItemGenerator && (
        <div className={styles.modal} onClick={() => setShowItemGenerator(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Generate Magical Item</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowItemGenerator(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.generatorContent}>
              <p>Describe the item you want to generate:</p>
              <textarea
                value={itemPrompt}
                onChange={(e) => setItemPrompt(e.target.value)}
                placeholder="e.g., A flaming sword that deals extra fire damage, or a ring that grants invisibility once per day"
                className={styles.promptInput}
                rows={4}
              />
              <div className={styles.generatorActions}>
                <button 
                  className={styles.generateButton}
                  onClick={handleGenerateItem}
                  disabled={!itemPrompt.trim()}
                >
                  Generate Item
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={() => setShowItemGenerator(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

