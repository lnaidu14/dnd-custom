import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './BackgroundInput.module.css';

export default function BackgroundInput({ onGenerate }) {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [presets, setPresets] = useState([
    'Tavern interior',
    'Forest clearing',
    'Dungeon chamber',
    'City street',
    'Castle throne room'
  ]);

  const handleGenerate = async (customPrompt) => {
    setGenerating(true);
    try {
      await onGenerate(customPrompt || prompt);
      if (customPrompt && !presets.includes(customPrompt)) {
        setPresets(prev => [customPrompt, ...prev].slice(0, 8));
      }
    } catch (error) {
      console.error('Background generation failed:', error);
    }
    setGenerating(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the scene..."
          className={styles.input}
        />
        <button
          onClick={() => handleGenerate()}
          disabled={generating || !prompt}
          className={styles.generateButton}
        >
          {generating ? 'Generating...' : 'Generate'}
        </button>
      </div>

      <div className={styles.presets}>
        {presets.map(preset => (
          <button
            key={preset}
            onClick={() => handleGenerate(preset)}
            disabled={generating}
            className={styles.presetButton}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  );
}
