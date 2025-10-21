// /components/DiceRoller.js
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { rollDice } from "../../utils/dice";
import styles from "./DiceRoller.module.css";

export default function DiceRoller({ onRoll }) {
  const { colors } = useTheme();
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [notation, setNotation] = useState("1d20");

  const diceTypes = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];

  const handleRoll = async (diceType) => {
    setRolling(true);

    // Animate dice roll
    const rolls = [];
    const iterations = 10;
    for (let i = 0; i < iterations; i++) {
      const randomValue =
        Math.floor(Math.random() * parseInt(diceType.slice(1))) + 1;
      rolls.push(randomValue);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    // Get final result from server
    const result = await onRoll(diceType);
    setLastResult(result);
    setHistory((prev) => [
      {
        type: diceType,
        result,
        timestamp: Date.now(),
      },
      ...prev,
    ].slice(0, 10));

    setRolling(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.diceGrid}>
        {diceTypes.map((type) => (
          <button
            key={type}
            className={`${styles.die} ${
              rolling ? styles.rolling : ""
            }`}
            onClick={() => handleRoll(type)}
            disabled={rolling}
          >
            {type}
          </button>
        ))}
      </div>

      {lastResult && (
        <div className={styles.result}>
          <span className={styles.number}>{lastResult}</span>
        </div>
      )}

      <div className={styles.history}>
        {history.map((roll, index) => (
          <div key={index} className={styles.historyItem}>
            {roll.type}: {roll.result}
          </div>
        ))}
      </div>
    </div>
  );
}
