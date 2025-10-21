import { useState, useEffect } from 'react';
import styles from './InitiativeTracker.module.css';

export default function InitiativeTracker({ characters, onInitiativeChange, isDM }) {
    const [initiativeOrder, setInitiativeOrder] = useState([]);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [inCombat, setInCombat] = useState(false);
    const [rollingCharacters, setRollingCharacters] = useState(new Set());

    useEffect(() => {
        // Update initiative order when characters change
        const charactersWithInitiative = characters
            .filter(char => char.initiative !== undefined)
            .sort((a, b) => (b.initiative || 0) - (a.initiative || 0));
        setInitiativeOrder(charactersWithInitiative);
    }, [characters]);

    const rollInitiative = async (character) => {
        const dexMod = Math.floor(((character.dex || 10) - 10) / 2);
        
        // Start rolling animation
        setRollingCharacters(prev => new Set([...prev, character.id]));
        
        // Animate random numbers for 1 second
        const animationDuration = 1000;
        const intervalTime = 50;
        const iterations = animationDuration / intervalTime;
        let currentIteration = 0;
        
        const interval = setInterval(() => {
            const tempRoll = Math.floor(Math.random() * 20) + 1 + dexMod;
            onInitiativeChange(character.id, tempRoll);
            
            currentIteration++;
            if (currentIteration >= iterations) {
                clearInterval(interval);
                
                // Final result
                const finalRoll = Math.floor(Math.random() * 20) + 1 + dexMod;
                onInitiativeChange(character.id, finalRoll);
                
                // Stop rolling animation
                setRollingCharacters(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(character.id);
                    return newSet;
                });
            }
        }, intervalTime);
    };

    const startCombat = () => {
        // Auto-roll initiative for all characters
        characters.forEach(character => {
            rollInitiative(character);
        });
        setInCombat(true);
        setCurrentTurn(0);
    };

    const endCombat = () => {
        setInCombat(false);
        setCurrentTurn(0);
        // Clear all initiative values
        characters.forEach(char => {
            if (char.initiative !== undefined) {
                onInitiativeChange(char.id, undefined);
            }
        });
    };

    const nextTurn = () => {
        setCurrentTurn((prev) => (prev + 1) % initiativeOrder.length);
    };

    const prevTurn = () => {
        setCurrentTurn((prev) => (prev - 1 + initiativeOrder.length) % initiativeOrder.length);
    };

    // Only show if in combat or if DM wants to manage combat
    if (!isDM && !inCombat) {
        return null;
    }

    return (
        <div className={styles.tracker}>
            <div className={styles.header}>
                <h4>Initiative Tracker</h4>
                {isDM && (
                    <div className={styles.controls}>
                        {!inCombat ? (
                            <>
                                <button onClick={startCombat} className={styles.startButton}>
                                    Start Combat
                                </button>
                                <button 
                                    onClick={() => characters.forEach(char => rollInitiative(char))} 
                                    className={styles.rollAllButton}
                                >
                                    Roll All
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={prevTurn} className={styles.turnButton}>
                                    ← Prev
                                </button>
                                <button onClick={nextTurn} className={styles.turnButton}>
                                    Next →
                                </button>
                                <button onClick={endCombat} className={styles.endButton}>
                                    End Combat
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.characterList}>
                {/* Show characters sorted by initiative in combat, or all characters otherwise */}
                {(inCombat ? initiativeOrder : characters).map((character, index) => (
                    <div 
                        key={character.id} 
                        className={`${styles.character} ${
                            inCombat && initiativeOrder[currentTurn]?.id === character.id ? styles.active : ''
                        } ${rollingCharacters.has(character.id) ? styles.rolling : ''}`}
                    >
                        <div className={styles.characterInfo}>
                            <span className={styles.name}>
                                {isDM || character.isPlayer ? character.name : 'Unknown'}
                            </span>
                            <span className={`${styles.initiative} ${rollingCharacters.has(character.id) ? styles.animating : ''}`}>
                                {character.initiative || '—'}
                            </span>
                        </div>
                        
                        {isDM && (
                            <button 
                                onClick={() => rollInitiative(character)}
                                className={`${styles.rollButton} ${rollingCharacters.has(character.id) ? styles.rolling : ''}`}
                                disabled={inCombat || rollingCharacters.has(character.id)}
                            >
                                {rollingCharacters.has(character.id) ? 'Rolling...' : 'Roll'}
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {inCombat && initiativeOrder.length > 0 && (
                <div className={styles.currentTurn}>
                    Current Turn: <strong>{initiativeOrder[currentTurn]?.name}</strong>
                </div>
            )}
        </div>
    );
}