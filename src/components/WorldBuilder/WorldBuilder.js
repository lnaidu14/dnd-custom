import { useState } from 'react';
import styles from './WorldBuilder.module.css';

export default function WorldBuilder({ onGenerate }) {
  const [theme, setTheme] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/world/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme })
      });
      const data = await response.json();
      onGenerate(data);
    } catch (error) {
      console.error('World generation failed:', error);
    }
    setGenerating(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>World Builder</h2>
      <input
        className={styles.input}
        type="text"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        placeholder="Enter world theme (e.g., 'League of Legends')"
      />
      <button 
        className={styles.button}
        onClick={handleGenerate}
        disabled={generating || !theme}
      >
        {generating ? 'Generating...' : 'Generate World'}
      </button>
      {generating && (
        <p className={styles.loading}>Generating your world...</p>
      )}
    </div>
  );
}