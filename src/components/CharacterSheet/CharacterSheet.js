import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './CharacterSheet.module.css';

export default function CharacterSheet({ character, onUpdate, isEditable = false }) {
  const { colors } = useTheme();
  const [editing, setEditing] = useState(false);
  const [editedCharacter, setEditedCharacter] = useState(character);

  const abilityScores = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  const skills = {
    'Acrobatics': 'DEX',
    'Animal Handling': 'WIS',
    'Arcana': 'INT',
    'Athletics': 'STR',
    'Deception': 'CHA',
    'History': 'INT',
    'Insight': 'WIS',
    'Intimidation': 'CHA',
    'Investigation': 'INT',
    'Medicine': 'WIS',
    'Nature': 'INT',
    'Perception': 'WIS',
    'Performance': 'CHA',
    'Persuasion': 'CHA',
    'Religion': 'INT',
    'Sleight of Hand': 'DEX',
    'Stealth': 'DEX',
    'Survival': 'WIS'
  };

  const getAbilityModifier = (score) => {
    return Math.floor((score - 10) / 2);
  };

  const getProficiencyBonus = (level) => {
    return Math.ceil(level / 4) + 1;
  };

  const getSkillModifier = (skillName, abilityScore, proficiency = false) => {
    const abilityMod = getAbilityModifier(abilityScore);
    const profBonus = proficiency ? getProficiencyBonus(character.level || 1) : 0;
    return abilityMod + profBonus;
  };

  const handleStatChange = (stat, value) => {
    setEditedCharacter(prev => ({
      ...prev,
      [stat]: parseInt(value) || 0
    }));
  };

  const handleSave = () => {
    onUpdate(editedCharacter);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditedCharacter(character);
    setEditing(false);
  };

  if (!character) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h3>No Character Selected</h3>
          <p>Select a character to view their sheet</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>{character.name || 'Unnamed Character'}</h2>
        <div className={styles.basicInfo}>
          <span>Level {character.level || 1}</span>
          <span>{character.class || 'Adventurer'}</span>
          <span>{character.race || 'Human'}</span>
        </div>
        {isEditable && (
          <button 
            className={styles.editButton}
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <div className={styles.content}>
        {/* Ability Scores */}
        <div className={styles.section}>
          <h3>Ability Scores</h3>
          <div className={styles.abilityGrid}>
            {abilityScores.map(ability => {
              const score = editedCharacter[ability.toLowerCase()] || 10;
              const modifier = getAbilityModifier(score);
              return (
                <div key={ability} className={styles.abilityScore}>
                  <label>{ability}</label>
                  {editing ? (
                    <input
                      type="number"
                      value={score}
                      onChange={(e) => handleStatChange(ability.toLowerCase(), e.target.value)}
                      className={styles.statInput}
                    />
                  ) : (
                    <div className={styles.scoreDisplay}>
                      <span className={styles.score}>{score}</span>
                      <span className={styles.modifier}>
                        {modifier >= 0 ? '+' : ''}{modifier}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Skills */}
        <div className={styles.section}>
          <h3>Skills</h3>
          <div className={styles.skillsGrid}>
            {Object.entries(skills).map(([skillName, ability]) => {
              const abilityScore = editedCharacter[ability.toLowerCase()] || 10;
              const proficiency = editedCharacter.proficiencies?.includes(skillName) || false;
              const modifier = getSkillModifier(skillName, abilityScore, proficiency);
              
              return (
                <div key={skillName} className={styles.skill}>
                  <label className={styles.skillLabel}>
                    <input
                      type="checkbox"
                      checked={proficiency}
                      onChange={(e) => {
                        const newProficiencies = proficiency
                          ? (editedCharacter.proficiencies || []).filter(p => p !== skillName)
                          : [...(editedCharacter.proficiencies || []), skillName];
                        setEditedCharacter(prev => ({
                          ...prev,
                          proficiencies: newProficiencies
                        }));
                      }}
                      disabled={!editing}
                      className={styles.proficiencyCheckbox}
                    />
                    <span className={styles.skillName}>{skillName}</span>
                    <span className={styles.skillAbility}>({ability})</span>
                  </label>
                  <span className={styles.skillModifier}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Combat Stats */}
        <div className={styles.section}>
          <h3>Combat</h3>
          <div className={styles.combatStats}>
            <div className={styles.combatStat}>
              <label>Armor Class</label>
              {editing ? (
                <input
                  type="number"
                  value={editedCharacter.armorClass || 10}
                  onChange={(e) => handleStatChange('armorClass', e.target.value)}
                  className={styles.statInput}
                />
              ) : (
                <span className={styles.statValue}>{character.armorClass || 10}</span>
              )}
            </div>
            <div className={styles.combatStat}>
              <label>Hit Points</label>
              {editing ? (
                <div className={styles.hpInputs}>
                  <input
                    type="number"
                    value={editedCharacter.currentHP || 1}
                    onChange={(e) => handleStatChange('currentHP', e.target.value)}
                    className={styles.statInput}
                    placeholder="Current"
                  />
                  <span>/</span>
                  <input
                    type="number"
                    value={editedCharacter.maxHP || 1}
                    onChange={(e) => handleStatChange('maxHP', e.target.value)}
                    className={styles.statInput}
                    placeholder="Max"
                  />
                </div>
              ) : (
                <span className={styles.statValue}>
                  {character.currentHP || 1}/{character.maxHP || 1}
                </span>
              )}
            </div>
            <div className={styles.combatStat}>
              <label>Speed</label>
              {editing ? (
                <input
                  type="number"
                  value={editedCharacter.movementSpeed || 30}
                  onChange={(e) => handleStatChange('movementSpeed', e.target.value)}
                  className={styles.statInput}
                />
              ) : (
                <span className={styles.statValue}>{character.movementSpeed || 30} ft</span>
              )}
            </div>
            <div className={styles.combatStat}>
              <label>Proficiency Bonus</label>
              <span className={styles.statValue}>
                +{getProficiencyBonus(character.level || 1)}
              </span>
            </div>
          </div>
        </div>

        {/* Saving Throws */}
        <div className={styles.section}>
          <h3>Saving Throws</h3>
          <div className={styles.savingThrows}>
            {abilityScores.map(ability => {
              const abilityScore = editedCharacter[ability.toLowerCase()] || 10;
              const proficiency = editedCharacter.savingThrowProficiencies?.includes(ability) || false;
              const modifier = getSkillModifier(ability, abilityScore, proficiency);
              
              return (
                <div key={ability} className={styles.savingThrow}>
                  <label className={styles.savingThrowLabel}>
                    <input
                      type="checkbox"
                      checked={proficiency}
                      onChange={(e) => {
                        const newProficiencies = proficiency
                          ? (editedCharacter.savingThrowProficiencies || []).filter(p => p !== ability)
                          : [...(editedCharacter.savingThrowProficiencies || []), ability];
                        setEditedCharacter(prev => ({
                          ...prev,
                          savingThrowProficiencies: newProficiencies
                        }));
                      }}
                      disabled={!editing}
                      className={styles.proficiencyCheckbox}
                    />
                    <span>{ability}</span>
                  </label>
                  <span className={styles.savingThrowModifier}>
                    {modifier >= 0 ? '+' : ''}{modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment */}
        <div className={styles.section}>
          <h3>Equipment</h3>
          <div className={styles.equipment}>
            <div className={styles.equipmentSlot}>
              <label>Weapon</label>
              <span className={styles.equipmentItem}>
                {character.weapon?.name || 'Unarmed'}
              </span>
            </div>
            <div className={styles.equipmentSlot}>
              <label>Armor</label>
              <span className={styles.equipmentItem}>
                {character.armor?.name || 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {editing && (
        <div className={styles.editActions}>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Changes
          </button>
          <button className={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

