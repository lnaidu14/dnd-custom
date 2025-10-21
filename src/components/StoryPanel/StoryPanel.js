import { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './StoryPanel.module.css';

export default function StoryPanel({ campaign, onUpdate }) {
  const { colors } = useTheme();
  const [activeNote, setActiveNote] = useState(null);
  const [notes, setNotes] = useState(campaign.notes || []);

  const addNote = (type) => {
    const newNote = {
      id: crypto.randomUUID(),
      type,
      title: 'New Note',
      content: '',
      timestamp: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
  };

  const updateNote = (id, updates) => {
    const updatedNotes = notes.map(note => 
      note.id === id ? { ...note, ...updates } : note
    );
    setNotes(updatedNotes);
    onUpdate(updatedNotes);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <button onClick={() => addNote('quest')}>Add Quest</button>
        <button onClick={() => addNote('lore')}>Add Lore</button>
        <div className={styles.noteList}>
          {notes.map(note => (
            <div 
              key={note.id}
              className={`${styles.noteItem} ${activeNote?.id === note.id ? styles.active : ''}`}
              onClick={() => setActiveNote(note)}
            >
              <span className={styles.noteIcon}>
                {note.type === 'quest' ? '⚔️' : '📚'}
              </span>
              {note.title}
            </div>
          ))}
        </div>
      </div>
      
      {activeNote && (
        <div className={styles.editor}>
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
            className={styles.titleInput}
          />
          <textarea
            value={activeNote.content}
            onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
            className={styles.contentInput}
          />
        </div>
      )}
    </div>
  );
}