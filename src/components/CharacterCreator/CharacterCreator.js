// /components/CharacterCreator.js
import { useState } from "react";
import styles from "./CharacterCreator.module.css";

export default function CharacterCreator({ onSubmit, onCancel, title }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0000ff"); // default blue
  const [hp, setHp] = useState(20);
  const [ac, setAc] = useState(15);

  const handleSubmit = () => {
    if (!name) return alert("Enter a name!");
    onSubmit({ id: Date.now(), label: name, color, hp, ac, x: 0, y: 0 });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{title || "Create Your Character"}</h2>

      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Character Name"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <input
          className={styles.inputColor}
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>HP</label>
        <input
          className={styles.input}
          type="number"
          value={hp}
          onChange={(e) => setHp(parseInt(e.target.value))}
          min={1}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>AC</label>
        <input
          className={styles.input}
          type="number"
          value={ac}
          onChange={(e) => setAc(parseInt(e.target.value))}
          min={1}
        />
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn} onClick={handleSubmit}>
          Create
        </button>
        <button className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
