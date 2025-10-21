// /components/JoinCampaign.js
import { useState } from "react";
import styles from "./JoinCampaign.module.css";

export default function JoinCampaign({ onJoin, onCancel }) {
  const [campaignId, setCampaignId] = useState("");
  const [playerName, setPlayerName] = useState("");

  const handleJoin = () => {
    if (!campaignId || !playerName) return alert("Fill all fields!");
    onJoin({ campaignId, playerName });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Join Campaign</h2>

      <div className={styles.field}>
        <label className={styles.label}>Campaign ID</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Your Name</label>
        <input
          className={styles.input}
          type="text"
          placeholder="Your Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className={styles.buttons}>
        <button className={styles.btn} onClick={handleJoin}>
          Join
        </button>
        <button className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
