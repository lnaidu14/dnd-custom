import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import Token from '../Token/Token';
import styles from './Board.module.css';

export default function Board({ campaign = { gridSize: 10 }, onTokenMove, onAction, isDM, currentScene }) {
  const { colors } = useTheme();
  const [grid, setGrid] = useState([]);
  const [selectedToken, setSelectedToken] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [actionMode, setActionMode] = useState(null); // 'move', 'attack', 'interact'
  const [targetCells, setTargetCells] = useState([]);
  const [environmentalObjects, setEnvironmentalObjects] = useState([]);
  const [draggedToken, setDraggedToken] = useState(null);

  const initializeGrid = useCallback(() => {
    const newGrid = [];
    for (let y = 0; y < campaign.gridSize; y++) {
      const row = [];
      for (let x = 0; x < campaign.gridSize; x++) {
        row.push({
          x,
          y,
          type: 'empty',
          highlighted: false,
          occupied: false,
          elevation: 0, // 0 = ground level, positive = higher
          cover: 'none', // 'none', 'half', 'full'
          environmental: null, // environmental objects
          hazardous: false // fire, acid, etc.
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  }, [campaign.gridSize]);

  const handleDragStart = (e, token) => {
    setDraggedToken(token);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, x, y) => {
    e.preventDefault();
    if (draggedToken && onTokenMove) {
      onTokenMove(draggedToken, { x, y });
    }
    setDraggedToken(null);
  };

  const handleCellClick = (x, y) => {
    const cell = grid[y]?.[x];
    if (!cell) return;

    if (actionMode === 'move' && selectedToken && isValidMove(x, y)) {
      onTokenMove(selectedToken, { x, y });
      setSelectedToken(null);
      setHighlightedCells([]);
      setActionMode(null);
    } else if (actionMode === 'attack' && selectedToken) {
      handleAttack(selectedToken, x, y);
    } else if (actionMode === 'interact' && cell.environmental) {
      handleEnvironmentalInteraction(cell.environmental, x, y);
    } else if (cell.environmental && !actionMode) {
      // Show interaction options for environmental objects
      setActionMode('interact');
      setTargetCells([{ x, y }]);
    }
  };

  const showMovementRange = (token) => {
    const range = token.movementSpeed / 5; // 5 feet per square
    const newHighlights = [];
    
    for (let y = Math.max(0, token.y - range); y <= Math.min(campaign.gridSize - 1, token.y + range); y++) {
      for (let x = Math.max(0, token.x - range); x <= Math.min(campaign.gridSize - 1, token.x + range); x++) {
        if (Math.abs(x - token.x) + Math.abs(y - token.y) <= range) {
          newHighlights.push({ x, y });
        }
      }
    }
    
    setHighlightedCells(newHighlights);
    setActionMode('move');
  };

  const showAttackRange = (token) => {
    const range = token.weapon?.range || 5; // Default 5 feet for melee
    const newHighlights = [];
    
    for (let y = Math.max(0, token.y - range); y <= Math.min(campaign.gridSize - 1, token.y + range); y++) {
      for (let x = Math.max(0, token.x - range); x <= Math.min(campaign.gridSize - 1, token.x + range); x++) {
        if (Math.abs(x - token.x) + Math.abs(y - token.y) <= range) {
          newHighlights.push({ x, y });
        }
      }
    }
    
    setHighlightedCells(newHighlights);
    setActionMode('attack');
  };

  const handleAttack = (attacker, targetX, targetY) => {
    const target = (campaign.tokens || []).find(token => token.x === targetX && token.y === targetY);
    if (!target) return;

    // Calculate elevation bonus
    const attackerElevation = grid[attacker.y]?.[attacker.x]?.elevation || 0;
    const targetElevation = grid[targetY]?.[targetX]?.elevation || 0;
    const elevationBonus = attackerElevation > targetElevation ? 2 : 0;

    // Calculate cover penalty
    const cover = grid[targetY]?.[targetX]?.cover || 'none';
    const coverPenalty = cover === 'half' ? 2 : cover === 'full' ? 999 : 0;

    onAction('attack', {
      attacker,
      target,
      elevationBonus,
      coverPenalty,
      position: { x: targetX, y: targetY }
    });

    setActionMode(null);
    setHighlightedCells([]);
  };

  const handleEnvironmentalInteraction = (environmental, x, y) => {
    onAction('interact', {
      object: environmental,
      position: { x, y }
    });
    setActionMode(null);
    setTargetCells([]);
  };

  const addEnvironmentalObject = (x, y, type, properties = {}) => {
    const newObject = {
      id: crypto.randomUUID(),
      type,
      x,
      y,
      ...properties
    };
    
    setEnvironmentalObjects(prev => [...prev, newObject]);
    
    // Update grid cell
    setGrid(prev => prev.map((row, rowY) => 
      row.map((cell, cellX) => 
        cellX === x && rowY === y 
          ? { ...cell, environmental: newObject }
          : cell
      )
    ));
  };

  const isValidMove = (x, y) => {
    const cell = grid[y]?.[x];
    if (!cell) return false;
    
    // Check if cell is occupied
    const occupied = (campaign.tokens || []).some(token => token.x === x && token.y === y);
    if (occupied) return false;
    
    // Check if cell has full cover (can't move through)
    if (cell.cover === 'full') return false;
    
    // Check if cell is hazardous (might need saving throw)
    if (cell.hazardous) return true; // Allow but might trigger effect
    
    return true;
  };

  useEffect(() => {
    initializeGrid();
  }, [initializeGrid]);

  // Get scene background image
  const getSceneImage = () => {
    // First try campaign synced image
    if (campaign.currentSceneImage) {
      console.log('Using synced scene image from campaign');
      return campaign.currentSceneImage;
    }
    
    // Fallback to localStorage
    let sceneImage = localStorage.getItem('current_scene_image');
    
    // If we have a current scene name, try that too
    if (!sceneImage && currentScene) {
      const sceneKey = `scene_image_${currentScene.replace(/[^a-zA-Z0-9]/g, '_')}`;
      sceneImage = localStorage.getItem(sceneKey);
    }
    
    // Debug logging
    console.log('Looking for scene image:', { 
      currentScene, 
      syncedImage: !!campaign.currentSceneImage,
      localImage: !!sceneImage 
    });
    
    return sceneImage;
  };

  const sceneImage = getSceneImage();

  return (
    <div 
      className={styles.board}
      style={{ 
        '--grid-size': campaign.gridSize,
        backgroundImage: sceneImage ? `url(${sceneImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {grid.map((row, y) => (
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className={`${styles.cell} ${highlightedCells.some(h => h.x === x && h.y === y) ? styles.highlighted : ''}`}
            onClick={() => handleCellClick(x, y)}
          >
            {(campaign.tokens || [])
              .filter(token => token.x === x && token.y === y)
              .map(token => (
                <Token
                  key={token.id}
                  token={token}
                  selected={selectedToken?.id === token.id}
                  isDM={isDM}
                  onDragStart={handleDragStart}
                  onClick={() => {
                    setSelectedToken(token);
                    showMovementRange(token);
                  }}
                  onRightClick={() => {
                    setSelectedToken(token);
                    showAttackRange(token);
                  }}
                />
              ))}
            
            {/* Environmental Objects */}
            {(campaign.environmentalObjects || [])
              .filter(obj => obj.x === x && obj.y === y)
              .map(obj => (
                <div key={obj.id} className={styles.environmentalObject}>
                  {obj.aiIcon ? (
                    <img 
                      src={obj.aiIcon} 
                      alt={obj.type}
                      className={styles.aiIcon}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className={styles.textIcon}>
                      {obj.type?.charAt(0)?.toUpperCase() || 'O'}
                    </div>
                  )}
                </div>
              ))}
            
            {/* Elevation Indicator */}
            {cell.elevation > 0 && (
              <div className={styles.elevationIndicator}>
                +{cell.elevation}
              </div>
            )}
            
            {/* Cover Indicator */}
            {cell.cover !== 'none' && (
              <div className={`${styles.coverIndicator} ${styles[cell.cover]}`}>
                {cell.cover === 'half' && 'H'}
                {cell.cover === 'full' && 'F'}
              </div>
            )}

          </div>
        ))
      ))}
    </div>
  );
}
