// /components/CombatControls.js
import styles from "./CombatControls.module.css";

export default function CombatControls({
  tokens,
  initiative,
  currentTurnIndex,
  onRollDice,
  onRollInitiative,
  onAttack,
  diceResult,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <button onClick={onRollDice} className={styles.btn}>Roll 1d20</button>
        {diceResult && (
          <span className={styles.diceResult}>
            Rolls: {diceResult.rolls.join(", ")} | Total: {diceResult.total}
          </span>
        )}
        <button onClick={onRollInitiative} className={styles.btn}>Roll Initiative</button>
      </div>

      {initiative.length > 0 && (
        <div className={styles.initiativeCard}>
          <h3>Initiative Order</h3>
          <ol>
            {initiative.map((i, idx) => (
              <li
                key={i.token}
                className={idx === currentTurnIndex ? styles.currentTurn : ""}
              >
                {i.token} → {i.total}
              </li>
            ))}
          </ol>
          <button onClick={onAttack} className={styles.attackBtn}>Attack</button>
        </div>
      )}
    </div>
  );
}
