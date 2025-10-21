import { useState } from 'react';
import styles from './InteractiveDiceRoller.module.css';

const DICE_TYPES = [
  { sides: 4, name: 'd4', color: '#ff6b6b' },
  { sides: 6, name: 'd6', color: '#4ecdc4' },
  { sides: 8, name: 'd8', color: '#45b7d1' },
  { sides: 10, name: 'd10', color: '#96ceb4' },
  { sides: 12, name: 'd12', color: '#feca57' },
  { sides: 20, name: 'd20', color: '#ff9ff3' }
];

export default function InteractiveDiceRoller({ character, onRoll, availableCharacters = [] }) {
  const [rollingDice, setRollingDice] = useState({});
  const [results, setResults] = useState({});
  const [customInput, setCustomInput] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(character);
  
  const getProficiencyBonus = (level) => {
    return Math.ceil(level / 4) + 1; // D&D 5e proficiency bonus formula
  };

  const getCharacterBonus = (diceType, rollType = 'attack') => {
    const activeChar = selectedCharacter || character;
    if (!activeChar) return 0;
    
    const level = activeChar.level || 1;
    const profBonus = getProficiencyBonus(level);
    
    switch (diceType) {
      case 'd20':
        if (rollType === 'attack') {
          // Attack roll: ability modifier + proficiency bonus
          const abilityMod = getAbilityModifier(activeChar.str || 10);
          return abilityMod + profBonus;
        } else if (rollType === 'save') {
          // Saving throw: ability modifier (+ proficiency if proficient)
          return getAbilityModifier(activeChar.wis || 10);
        }
        return getAbilityModifier(activeChar.dex || 10);
      case 'd6':
      case 'd8':
        // Damage dice: ability modifier
        return getAbilityModifier(activeChar.str || 10);
      default:
        return 0;
    }
  };
  
  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const parseCustomDice = (input) => {
    // Parse expressions like "2d6+3", "1d20+5", "3d8-1"
    const regex = /(\d+)d(\d+)([+-]\d+)?/i;
    const match = input.trim().match(regex);
    
    if (!match) {
      throw new Error('Invalid dice format. Use format like "2d6+3" or "1d20"');
    }
    
    const count = parseInt(match[1]);
    const sides = parseInt(match[2]);
    const modifier = match[3] ? parseInt(match[3]) : 0;
    
    return { count, sides, modifier };
  };

  const rollCustomDice = async () => {
    if (!customInput.trim()) return;
    
    try {
      const { count, sides, modifier } = parseCustomDice(customInput);
      
      // Start rolling animation
      setRollingDice(prev => ({ ...prev, custom: true }));
      
      // Animate for 1 second
      const animationDuration = 1000;
      const intervalTime = 50;
      const iterations = animationDuration / intervalTime;
      let currentIteration = 0;
      
      const interval = setInterval(() => {
        // Show random values during animation
        const tempRolls = [];
        for (let i = 0; i < count; i++) {
          tempRolls.push(Math.floor(Math.random() * sides) + 1);
        }
        const tempTotal = tempRolls.reduce((sum, roll) => sum + roll, 0) + modifier;
        
        setResults(prev => ({ 
          ...prev, 
          custom: { 
            rolls: tempRolls, 
            modifier, 
            total: tempTotal,
            expression: customInput
          } 
        }));
        
        currentIteration++;
        if (currentIteration >= iterations) {
          clearInterval(interval);
          
          // Final result
          const finalRolls = [];
          for (let i = 0; i < count; i++) {
            finalRolls.push(Math.floor(Math.random() * sides) + 1);
          }
          const baseTotal = finalRolls.reduce((sum, roll) => sum + roll, 0);
          const finalTotal = baseTotal + modifier;
          
          setResults(prev => ({ 
            ...prev, 
            custom: { 
              rolls: finalRolls, 
              modifier, 
              total: finalTotal,
              expression: customInput,
              baseTotal
            } 
          }));
          setRollingDice(prev => ({ ...prev, custom: false }));
          
          // Notify parent component
          if (onRoll) {
            onRoll({
              dice: customInput,
              rolls: finalRolls,
              baseTotal,
              modifier,
              total: finalTotal,
              character: character?.name,
              timestamp: new Date().toISOString()
            });
          }
        }
      }, intervalTime);
      
    } catch (error) {
      alert(error.message);
    }
  };

  const rollDice = async (diceType) => {
    const { sides, name } = diceType;
    
    // Start rolling animation
    setRollingDice(prev => ({ ...prev, [name]: true }));
    
    // Animate random numbers for 1 second
    const animationDuration = 1000;
    const intervalTime = 50;
    const iterations = animationDuration / intervalTime;
    
    let currentIteration = 0;
    const interval = setInterval(() => {
      const randomValue = Math.floor(Math.random() * sides) + 1;
      setResults(prev => ({ ...prev, [name]: randomValue }));
      
      currentIteration++;
      if (currentIteration >= iterations) {
        clearInterval(interval);
        
        // Final result with character bonuses
        const baseRoll = Math.floor(Math.random() * sides) + 1;
        const bonus = getCharacterBonus(name);
        const finalResult = baseRoll + bonus;
        
        setResults(prev => ({ 
          ...prev, 
          [name]: { 
            total: finalResult, 
            base: baseRoll, 
            bonus: bonus 
          } 
        }));
        setRollingDice(prev => ({ ...prev, [name]: false }));
        
        // Notify parent component
        if (onRoll) {
          onRoll({
            dice: name,
            baseRoll: baseRoll,
            bonus: bonus,
            total: finalResult,
            sides: sides,
            character: character?.name,
            timestamp: new Date().toISOString()
          });
        }
      }
    }, intervalTime);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Dice Roller</h3>
        {availableCharacters.length > 0 && (
          <div className={styles.characterSelector}>
            <label>Rolling for: </label>
            <select 
              value={selectedCharacter?.id || ''} 
              onChange={(e) => {
                const char = availableCharacters.find(c => c.id === e.target.value);
                setSelectedCharacter(char);
              }}
              className={styles.characterSelect}
            >
              <option value="">No Character</option>
              {availableCharacters.map(char => (
                <option key={char.id} value={char.id}>
                  {char.name} ({char.class} {char.level})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className={styles.diceGrid}>
        {DICE_TYPES.map((dice) => (
          <div
            key={dice.name}
            className={`${styles.diceButton} ${
              rollingDice[dice.name] ? styles.rolling : ''
            }`}
            onClick={() => rollDice(dice)}
            style={{ '--dice-color': dice.color }}
          >
            <div className={styles.diceName}>{dice.name}</div>
            <div className={styles.diceResult}>
              {typeof results[dice.name] === 'object' 
                ? `${results[dice.name].total}${results[dice.name].bonus > 0 ? ` (${results[dice.name].base}+${results[dice.name].bonus})` : ''}`
                : results[dice.name] || '?'
              }
            </div>
            <div className={styles.diceSides}>1-{dice.sides}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
