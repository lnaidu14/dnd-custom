// /components/CampaignEditor.js
import { useState } from "react";
import styles from "./CampaignEditor.module.css";

export default function CampaignEditor({ onSubmit, onCancel }) {
  const [title, setTitle] = useState("");
  const [numPlayers, setNumPlayers] = useState(2);
  const [summary, setSummary] = useState("");

  const handleSubmit = () => {
    if (!title || !summary) return alert("Fill all fields!");
    onSubmit({ title, numPlayers, summary });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Create Campaign</h2>

      <div className={styles.field}>
        <label className={styles.label}>Campaign Title</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Campaign Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Number of Players</label>
        <input
          className={styles.input}
          type="number"
          min={1}
          value={numPlayers}
          onChange={(e) => setNumPlayers(parseInt(e.target.value))}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Campaign Summary</label>
        <textarea
          className={styles.textarea}
          placeholder="Campaign Summary (for AI)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
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
