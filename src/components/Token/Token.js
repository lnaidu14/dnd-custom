import styles from "./Token.module.css";

export default function Token({ token, onClick, onRightClick, selected, onDragStart, isDM }) {
  const handleContextMenu = (e) => {
    e.preventDefault();
    if (onRightClick) {
      onRightClick();
    }
  };

  const handleDragStart = (e) => {
    if (onDragStart) {
      onDragStart(e, token);
    }
  };

  return (
    <div
      className={`${styles.token} ${token.hp <= 0 ? styles.dead : ""} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      draggable={true}
      style={{ backgroundColor: token.aiIcon || token.customIcon ? 'transparent' : token.color }}
    >
      {(token.aiIcon || token.customIcon) ? (
        <img 
          src={token.aiIcon || token.customIcon} 
          alt={token.name}
          className={styles.tokenIcon}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
        />
      ) : (
        <div className={styles.tokenLabel}>
          {isDM || token.isPlayer ? (token.name || token.label) : 'Unknown'}
        </div>
      )}
      {(isDM || token.isPlayer) && token.hp !== undefined && (
        <div className={styles.hpIndicator}>
          {token.hp}/{token.maxHp || token.hp}
        </div>
      )}
    </div>
  );
}

