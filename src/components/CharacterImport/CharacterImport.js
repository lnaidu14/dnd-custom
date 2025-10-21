import { useState } from 'react';
import { CharacterImporter } from '../../services/characterImport';
import styles from './CharacterImport.module.css';

export default function CharacterImport({ onImport }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true);
    const importer = new CharacterImporter();
    const character = await importer.importFromSheet(file);
    onImport(character);
    setLoading(false);
  };

  return (
    <div className={styles.import}>
      <input 
        type="file" 
        accept="image/*,.pdf"
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button 
        onClick={handleImport}
        disabled={!file || loading}
      >
        {loading ? 'Importing...' : 'Import Character'}
      </button>
    </div>
  );
}