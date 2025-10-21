import { useState, useRef, useEffect } from 'react';
import styles from './MusicPlayer.module.css';

const MUSIC_TRACKS = {
  tavern: {
    name: 'Tavern Ambience',
    url: '/audio/tavern-ambience.mp3',
    loop: true
  },
  forest: {
    name: 'Forest Adventure',
    url: '/audio/forest-adventure.mp3',
    loop: true
  },
  dungeon: {
    name: 'Dungeon Depths',
    url: '/audio/dungeon-depths.mp3',
    loop: true
  },
  combat: {
    name: 'Epic Battle',
    url: '/audio/epic-battle.mp3',
    loop: true
  },
  victory: {
    name: 'Victory Fanfare',
    url: '/audio/victory-fanfare.mp3',
    loop: false
  }
};

export default function MusicPlayer({ currentScene, isDM }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('tavern');
  const [volume, setVolume] = useState(0.3);
  const [isMinimized, setIsMinimized] = useState(true);
  const audioRef = useRef(null);

  // Auto-select music based on scene
  useEffect(() => {
    if (currentScene && MUSIC_TRACKS[currentScene.toLowerCase()]) {
      setCurrentTrack(currentScene.toLowerCase());
    }
  }, [currentScene]);

  // Handle audio playback
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (trackKey) => {
    setCurrentTrack(trackKey);
    if (isPlaying) {
      // Will restart with new track due to useEffect
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const track = MUSIC_TRACKS[currentTrack];

  return (
    <div className={`${styles.musicPlayer} ${isMinimized ? styles.minimized : ''}`}>
      <div className={styles.header} onClick={() => setIsMinimized(!isMinimized)}>
        <span className={styles.icon}>🎵</span>
        <span className={styles.title}>Music</span>
        <button className={styles.minimizeBtn}>
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {!isMinimized && (
        <div className={styles.controls}>
          <div className={styles.nowPlaying}>
            <strong>{track?.name || 'No Track'}</strong>
          </div>

          <div className={styles.playbackControls}>
            <button 
              className={styles.playBtn}
              onClick={togglePlayback}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <div className={styles.volumeControl}>
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className={styles.volumeSlider}
              />
            </div>
          </div>

          {isDM && (
            <div className={styles.trackSelection}>
              <h4>Select Track:</h4>
              <div className={styles.trackGrid}>
                {Object.entries(MUSIC_TRACKS).map(([key, track]) => (
                  <button
                    key={key}
                    className={`${styles.trackBtn} ${currentTrack === key ? styles.active : ''}`}
                    onClick={() => changeTrack(key)}
                  >
                    {track.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <audio
            ref={audioRef}
            src={track?.url}
            loop={track?.loop}
            preload="metadata"
          />
        </div>
      )}
    </div>
  );
}
