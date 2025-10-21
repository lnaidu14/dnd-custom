import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { LocalAIService } from '../../services/aiService';
import styles from './QuickCharacterCreator.module.css';

export default function QuickCharacterCreator({ onCharacterCreate, onCancel, isDM }) {
  const { colors } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showTextImport, setShowTextImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [characterType, setCharacterType] = useState('player'); // 'player' or 'npc'
  const aiService = new LocalAIService();
  
  const [character, setCharacter] = useState({
    name: '',
    class: 'Fighter',
    race: 'Human',
    level: characterType === 'player' ? 1 : 3,
    alignment: 'Neutral',
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    hp: 10,
    maxHp: 10,
    ac: 10,
    movementSpeed: 30,
    x: 0,
    y: 0,
    // Character details
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    // Physical appearance
    age: '',
    height: '',
    weight: '',
    eyes: '',
    skin: '',
    hair: '',
    // Combat
    attacks: [],
    spellcasting: false,
    cantrips: [],
    spells: [],
    // Social
    allies: '',
    organizations: '',
    languages: [],
    proficiencies: [],
    features: [],
    traits: [],
    // Equipment
    equipment: [],
    inventory: []
  });

  const classes = ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Barbarian', 'Bard', 'Druid', 'Monk', 'Sorcerer', 'Warlock'];
  const races = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Dragonborn', 'Tiefling', 'Half-Orc', 'Half-Elf'];
  const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
  
  // Update level when character type changes
  const handleCharacterTypeChange = (type) => {
    setCharacterType(type);
    setCharacter(prev => ({
      ...prev,
      level: type === 'player' ? 1 : 3
    }));
  };

  const handleStatChange = (stat, value) => {
    setCharacter(prev => ({
      ...prev,
      [stat]: parseInt(value) || 0
    }));
  };

  const generateProperName = (className) => {
    const names = {
      wizard: ['Gandalf', 'Merlin', 'Elara', 'Theron', 'Mystral', 'Arcanus'],
      rogue: ['Shadow', 'Whisper', 'Dagger', 'Sly', 'Raven', 'Vex'],
      cleric: ['Seraphina', 'Benedict', 'Lyra', 'Thaddeus', 'Grace', 'Pious'],
      barbarian: ['Grok', 'Thora', 'Ragnar', 'Ulfric', 'Brenna', 'Axel'],
      fighter: ['Marcus', 'Valeria', 'Roland', 'Cassandra', 'Gareth', 'Vera']
    };
    const nameList = names[className] || names.fighter;
    return nameList[Math.floor(Math.random() * nameList.length)];
  };

  const calculateHP = (className, level, con) => {
    const conMod = Math.floor((con - 10) / 2);
    const hitDie = {
      'Wizard': 6, 'Rogue': 8, 'Cleric': 8, 'Barbarian': 12, 'Fighter': 10
    };
    const baseHP = hitDie[className] || 8;
    return baseHP + conMod + ((level - 1) * (Math.floor(baseHP / 2) + 1 + conMod));
  };

  const calculateAC = (className, dex) => {
    const dexMod = Math.floor((dex - 10) / 2);
    const baseAC = {
      'Wizard': 10 + dexMod, // No armor
      'Rogue': 11 + dexMod, // Leather armor
      'Cleric': 16, // Chain mail
      'Barbarian': 10 + dexMod, // Unarmored defense (simplified)
      'Fighter': 16 // Chain mail
    };
    return baseAC[className] || (10 + dexMod);
  };

  const getClassStats = (className) => {
    switch (className) {
      case 'Wizard':
        return { str: 8, dex: 12, con: 14, int: 16, wis: 13, cha: 10 };
      case 'Rogue':
        return { str: 10, dex: 16, con: 14, int: 12, wis: 13, cha: 8 };
      case 'Cleric':
        return { str: 14, dex: 10, con: 14, int: 8, wis: 16, cha: 12 };
      case 'Barbarian':
        return { str: 16, dex: 14, con: 16, int: 8, wis: 12, cha: 10 };
      case 'Fighter':
        return { str: 16, dex: 14, con: 15, int: 10, wis: 12, cha: 8 };
      default:
        return { str: 14, dex: 14, con: 14, int: 12, wis: 12, cha: 10 };
    }
  };


  const generateCharacterImage = async (character) => {
    try {
      const imagePrompt = `D&D character portrait: ${character.race} ${character.class} named ${character.name}, fantasy art style, detailed face, heroic pose, high quality, digital art`;
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          prompt: imagePrompt
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.image) {
          try {
            // Clear old character images to prevent quota issues
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('character_image_')) {
                keysToRemove.push(key);
              }
            }
            // Keep only the last 3 character images
            if (keysToRemove.length > 3) {
              keysToRemove.slice(0, -3).forEach(key => localStorage.removeItem(key));
            }
            
            // Store character image
            const characterKey = `character_image_${character.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
            localStorage.setItem(characterKey, result.image);
            console.log('Character image generated for:', character.name);
          } catch (quotaError) {
            console.warn('Character image storage quota exceeded, skipping storage');
            // Don't store the portrait, but continue with icon generation
          }
        }
      }
    } catch (error) {
      console.error('Character image generation failed:', error);
      throw error;
    }
  };

  const generateCharacterIcon = async (character) => {
    try {
      const iconPrompt = `D&D character token: ${character.race} ${character.class}, top-down view, game token style, circular frame, clean background, fantasy RPG, 64x64 pixel style`;
      
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image',
          prompt: iconPrompt
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.image) {
          try {
            // Clear old character icons to prevent quota issues
            const iconKeysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('character_icon_')) {
                iconKeysToRemove.push(key);
              }
            }
            // Keep only the last 5 character icons
            if (iconKeysToRemove.length > 5) {
              iconKeysToRemove.slice(0, -5).forEach(key => localStorage.removeItem(key));
            }
            
            // Store character icon
            const iconKey = `character_icon_${character.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
            localStorage.setItem(iconKey, result.image);
          } catch (quotaError) {
            console.warn('Character icon storage quota exceeded, using image directly');
          }
          
          character.aiIcon = result.image; // Add to character object
          console.log('Character icon generated for:', character.name);
          return result.image; // Return the image
        }
      }
      return null;
    } catch (error) {
      console.error('Character icon generation failed:', error);
      throw error;
    }
  };

  const generateRandomCharacter = (prompt, isDM) => {
    const names = ['Aeliana', 'Thorek', 'Zara', 'Gareth', 'Luna', 'Dain', 'Vera', 'Kael'];
    const classes = ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Barbarian'];
    const races = ['Human', 'Elf', 'Dwarf', 'Halfling'];
    
    const randomClass = classes[Math.floor(Math.random() * classes.length)];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRace = races[Math.floor(Math.random() * races.length)];
    const level = isDM ? 3 : 1;
    const stats = getClassStats(randomClass);
    
    return {
      name: randomName,
      class: randomClass,
      race: randomRace,
      level: level,
      ...stats,
      hp: calculateHP(randomClass, level, stats.con),
      ac: calculateAC(randomClass, stats.dex),
      movementSpeed: 30
    };
  };

  const generateAICharacter = async () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const prompt = `Create a D&D 5e character: "${aiPrompt}". 
      Return ONLY valid JSON:
      {
        "name": "Character Name",
        "class": "Fighter",
        "race": "Human", 
        "level": 3,
        "str": 15,
        "dex": 14,
        "con": 13,
        "int": 12,
        "wis": 10,
        "cha": 8,
        "hp": 25,
        "ac": 16,
        "movementSpeed": 30
      }
      
      Use classes: Fighter, Wizard, Rogue, Cleric, Ranger, Paladin, Barbarian, Bard, Druid, Monk, Sorcerer, Warlock
      Use races: Human, Elf, Dwarf, Halfling, Gnome, Dragonborn, Tiefling, Half-Orc, Half-Elf
      Stats 8-18, Level 1-5, HP 6-50, AC 10-20, Speed 25-40`;
      
      const response = await aiService.generateText(prompt);
      
      try {
        // Try to extract JSON from response
        let aiCharacter;
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiCharacter = JSON.parse(jsonMatch[0]);
        } else {
          aiCharacter = JSON.parse(response);
        }
        
        // Calculate HP based on class and constitution
        const conMod = Math.floor(((aiCharacter.con || 10) - 10) / 2);
        const baseHP = aiCharacter.class === 'Wizard' ? 6 : 
                      aiCharacter.class === 'Barbarian' ? 12 : 8;
        const calculatedHP = baseHP + conMod + ((aiCharacter.level || 1) - 1) * (Math.floor(baseHP/2) + 1 + conMod);
        
        // Calculate AC based on class and dexterity
        const dexMod = Math.floor(((aiCharacter.dex || 10) - 10) / 2);
        const baseAC = aiCharacter.class === 'Barbarian' ? 10 + dexMod + conMod :
                      aiCharacter.class === 'Wizard' ? 10 + dexMod :
                      aiCharacter.class === 'Fighter' ? 16 : 10 + dexMod;
        
        const finalCharacter = {
          ...aiCharacter,
          // Ensure valid values with proper calculations
          level: Math.max(1, Math.min(20, aiCharacter.level || 1)),
          str: Math.max(8, Math.min(18, aiCharacter.str || 10)),
          dex: Math.max(8, Math.min(18, aiCharacter.dex || 10)),
          con: Math.max(8, Math.min(18, aiCharacter.con || 10)),
          int: Math.max(8, Math.min(18, aiCharacter.int || 10)),
          wis: Math.max(8, Math.min(18, aiCharacter.wis || 10)),
          cha: Math.max(8, Math.min(18, aiCharacter.cha || 10)),
          hp: aiCharacter.hp || Math.max(1, calculatedHP),
          ac: aiCharacter.ac || Math.max(10, baseAC),
          movementSpeed: aiCharacter.movementSpeed || 30,
        };
        
        console.log('AI Generated Character:', finalCharacter);
        
        // Mark as AI generated for icon creation
        finalCharacter.isAIGenerated = true;
        
        // Set character first to show basic info
        setCharacter(finalCharacter);
        
        // Generate character portrait and icon
        try {
          await generateCharacterImage(finalCharacter);
          const iconResult = await generateCharacterIcon(finalCharacter);
          if (iconResult) {
            finalCharacter.aiIcon = iconResult;
            // Update character state with the icon
            setCharacter(prev => ({ ...prev, aiIcon: iconResult }));
          }
        } catch (imageError) {
          console.warn('Character image generation failed:', imageError);
        }
        setAiPrompt('');
      } catch (parseError) {
        console.warn('Failed to parse AI response, trying simpler AI generation');
        
        // Try a simpler AI prompt for just basic info
        try {
          const simplePrompt = `Generate a D&D character name and class for: "${aiPrompt}". 
          Respond with just: Name|Class|Race
          Example: Gandalf|Wizard|Human`;
          
          const simpleResponse = await aiService.generateText(simplePrompt);
          const parts = simpleResponse.split('|');
          
          if (parts.length >= 3) {
            const [name, characterClass, characterRace] = parts;
            const level = isDM ? 3 : 1;
            const stats = getClassStats(characterClass.trim());
            
            const aiGeneratedCharacter = {
              name: name.trim() || 'Generated Character',
              class: characterClass.trim() || 'Fighter',
              race: characterRace.trim() || 'Human',
              level: level,
              ...stats,
              hp: calculateHP(characterClass.trim(), level, stats.con),
              ac: calculateAC(characterClass.trim(), stats.dex),
              movementSpeed: 30
            };
            
            setCharacter(prev => ({ ...prev, ...aiGeneratedCharacter }));
            setAiPrompt('');
            console.log('Used simple AI generation:', aiGeneratedCharacter);
            return;
          }
        } catch (simpleError) {
          console.warn('Simple AI generation also failed');
        }
        
        // Final fallback with random generation
        const randomCharacter = generateRandomCharacter(aiPrompt, isDM);
        setCharacter(prev => ({ ...prev, ...randomCharacter }));
        setAiPrompt('');
        console.log('Used random generation:', randomCharacter);
      }
    } catch (error) {
      console.error('Character generation failed:', error);
      alert('Character generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIconImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        // Store the uploaded icon
        const iconKey = `character_icon_${character.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
        localStorage.setItem(iconKey, imageData);
        
        // Update character with custom icon
        setCharacter(prev => ({ ...prev, customIcon: imageData }));
        alert('Character icon uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file (.png, .jpg, .jpeg, .gif, .webp)');
    }
  };



  const handleCreate = async () => {
    if (!character.name.trim()) {
      alert('Please enter a character name');
      return;
    }

    const newCharacter = {
      ...character,
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      maxHp: character.hp, // Set maxHp to current hp
      currentHP: character.hp,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
      label: character.name.charAt(0).toUpperCase(),
      isPlayer: characterType === 'player', // Use selected character type
      isNPC: characterType === 'npc', // Mark NPCs
      aiIcon: character.aiIcon, // Include AI-generated icon
      customIcon: character.customIcon // Include custom uploaded icon
    };

    // Generate icon if none exists and this was AI-generated
    if (!newCharacter.aiIcon && !newCharacter.customIcon && character.isAIGenerated) {
      try {
        await generateCharacterIcon(newCharacter);
        newCharacter.aiIcon = newCharacter.aiIcon; // Update with generated icon
      } catch (error) {
        console.warn('Failed to generate character icon:', error);
      }
    }

    onCharacterCreate(newCharacter);
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h3>Create Character</h3>
            {/* Circular Icon Preview at Top */}
            {(character.aiIcon || character.customIcon) && (
              <div className={styles.topIconPreview}>
                <img 
                  src={character.aiIcon || character.customIcon} 
                  alt={character.name}
                  className={styles.topIcon}
                />
              </div>
            )}
          </div>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>

        {/* Character Type Tabs (DM Only) */}
        {isDM && (
          <div className={styles.characterTypeTabs}>
            <button 
              className={`${styles.tab} ${characterType === 'player' ? styles.activeTab : ''}`}
              onClick={() => handleCharacterTypeChange('player')}
            >
              👤 Player Character
            </button>
            <button 
              className={`${styles.tab} ${characterType === 'npc' ? styles.activeTab : ''}`}
              onClick={() => handleCharacterTypeChange('npc')}
            >
              🤖 NPC
            </button>
          </div>
        )}

        {/* AI Character Generator */}
        <div className={styles.aiSection}>
          <h4>🤖 AI Character Generator</h4>
          <div className={styles.aiInput}>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={characterType === 'player' ? 
                "e.g., 'Elven ranger archer', 'Human paladin knight'" : 
                "e.g., 'Tavern keeper', 'Goblin bandit leader', 'Wise old sage'"
              }
              disabled={isGenerating}
            />
            <button 
              onClick={generateAICharacter}
              disabled={isGenerating || !aiPrompt.trim()}
              className={styles.generateButton}
            >
              {isGenerating ? '🤖 Generating...' : '✨ Generate'}
            </button>
          </div>
          
          {/* Character Preview */}
          {(character.aiIcon || character.customIcon) && (
            <div className={styles.characterPreview}>
              <h5>Character Preview</h5>
              <img 
                src={character.aiIcon || character.customIcon} 
                alt={character.name}
                className={styles.previewImage}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <p>{character.name} - {character.race} {character.class}</p>
            </div>
          )}
        </div>

        {/* Manual Icon Upload - Only for DM */}
        {isDM && (
          <div className={styles.importSection}>
            <h4>🖼️ Manual Icon Upload</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Upload a custom character icon (optional - AI will generate one automatically)
            </p>
            <div className={styles.importOptions}>
              <label htmlFor="characterIconInput" className={styles.fileButton}>
                🖼️ Upload Custom Icon
              </label>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.gif,.webp"
                onChange={handleIconImport}
                style={{ display: 'none' }}
                id="characterIconInput"
              />
            </div>
          </div>
        )}

        <div className={styles.content}>
          <div className={styles.basicInfo}>
            <div className={styles.field}>
              <label>Name</label>
              <input
                type="text"
                value={character.name}
                onChange={(e) => setCharacter(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Character Name"
              />
            </div>

            <div className={styles.field}>
              <label>Class</label>
              <select
                value={character.class}
                onChange={(e) => setCharacter(prev => ({ ...prev, class: e.target.value }))}
              >
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Race</label>
              <select
                value={character.race}
                onChange={(e) => setCharacter(prev => ({ ...prev, race: e.target.value }))}
              >
                {races.map(race => (
                  <option key={race} value={race}>{race}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Level</label>
              <input
                type="number"
                value={character.level}
                onChange={(e) => handleStatChange('level', e.target.value)}
                min="1"
                max="20"
                disabled={characterType === 'player'} // Players always level 1
              />
            </div>

            <div className={styles.field}>
              <label>Alignment</label>
              <select
                value={character.alignment}
                onChange={(e) => setCharacter(prev => ({ ...prev, alignment: e.target.value }))}
              >
                {alignments.map(alignment => (
                  <option key={alignment} value={alignment}>{alignment}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.stats}>
            <h4>Ability Scores</h4>
            <div className={styles.statGrid}>
              {['str', 'dex', 'con', 'int', 'wis', 'cha'].map(stat => (
                <div key={stat} className={styles.statField}>
                  <label>{stat.toUpperCase()}</label>
                  <input
                    type="number"
                    value={character[stat]}
                    onChange={(e) => handleStatChange(stat, e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.combat}>
            <h4>Combat Stats</h4>
            <div className={styles.combatGrid}>
              <div className={styles.field}>
                <label>Hit Points</label>
                <input
                  type="number"
                  value={character.hp}
                  onChange={(e) => handleStatChange('hp', e.target.value)}
                  min="1"
                />
              </div>
              <div className={styles.field}>
                <label>Armor Class</label>
                <input
                  type="number"
                  value={character.ac}
                  onChange={(e) => handleStatChange('ac', e.target.value)}
                  min="1"
                />
              </div>
              <div className={styles.field}>
                <label>Speed (ft)</label>
                <input
                  type="number"
                  value={character.movementSpeed}
                  onChange={(e) => handleStatChange('movementSpeed', e.target.value)}
                  min="5"
                />
              </div>
            </div>
          </div>

          {/* Character Details */}
          <div className={styles.characterDetails}>
            <h4>Character Details</h4>
            <div className={styles.detailsGrid}>
              <div className={styles.field}>
                <label>Personality Traits</label>
                <textarea
                  value={character.personalityTraits}
                  onChange={(e) => setCharacter(prev => ({ ...prev, personalityTraits: e.target.value }))}
                  placeholder="Describe personality traits..."
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Ideals</label>
                <textarea
                  value={character.ideals}
                  onChange={(e) => setCharacter(prev => ({ ...prev, ideals: e.target.value }))}
                  placeholder="What drives this character..."
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Bonds</label>
                <textarea
                  value={character.bonds}
                  onChange={(e) => setCharacter(prev => ({ ...prev, bonds: e.target.value }))}
                  placeholder="Important connections..."
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Flaws</label>
                <textarea
                  value={character.flaws}
                  onChange={(e) => setCharacter(prev => ({ ...prev, flaws: e.target.value }))}
                  placeholder="Character weaknesses..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Physical Appearance */}
          <div className={styles.appearance}>
            <h4>Physical Appearance</h4>
            <div className={styles.appearanceGrid}>
              <div className={styles.field}>
                <label>Age</label>
                <input
                  type="text"
                  value={character.age}
                  onChange={(e) => setCharacter(prev => ({ ...prev, age: e.target.value }))}
                  placeholder="25"
                />
              </div>
              <div className={styles.field}>
                <label>Height</label>
                <input
                  type="text"
                  value={character.height}
                  onChange={(e) => setCharacter(prev => ({ ...prev, height: e.target.value }))}
                  placeholder="5'8 feet"
                />
              </div>
              <div className={styles.field}>
                <label>Weight</label>
                <input
                  type="text"
                  value={character.weight}
                  onChange={(e) => setCharacter(prev => ({ ...prev, weight: e.target.value }))}
                  placeholder="160 lbs"
                />
              </div>
              <div className={styles.field}>
                <label>Eyes</label>
                <input
                  type="text"
                  value={character.eyes}
                  onChange={(e) => setCharacter(prev => ({ ...prev, eyes: e.target.value }))}
                  placeholder="Blue"
                />
              </div>
              <div className={styles.field}>
                <label>Skin</label>
                <input
                  type="text"
                  value={character.skin}
                  onChange={(e) => setCharacter(prev => ({ ...prev, skin: e.target.value }))}
                  placeholder="Fair"
                />
              </div>
              <div className={styles.field}>
                <label>Hair</label>
                <input
                  type="text"
                  value={character.hair}
                  onChange={(e) => setCharacter(prev => ({ ...prev, hair: e.target.value }))}
                  placeholder="Brown"
                />
              </div>
            </div>
          </div>

          {/* Social & Background */}
          <div className={styles.social}>
            <h4>Social & Background</h4>
            <div className={styles.socialGrid}>
              <div className={styles.field}>
                <label>Allies & Organizations</label>
                <textarea
                  value={character.allies}
                  onChange={(e) => setCharacter(prev => ({ ...prev, allies: e.target.value }))}
                  placeholder="Important allies and organizations..."
                  rows={2}
                />
              </div>
              <div className={styles.field}>
                <label>Languages</label>
                <input
                  type="text"
                  value={character.languages.join(', ')}
                  onChange={(e) => setCharacter(prev => ({ ...prev, languages: e.target.value.split(', ').filter(l => l.trim()) }))}
                  placeholder="Common, Elvish, Draconic"
                />
              </div>
              <div className={styles.field}>
                <label>Other Proficiencies</label>
                <input
                  type="text"
                  value={character.proficiencies.join(', ')}
                  onChange={(e) => setCharacter(prev => ({ ...prev, proficiencies: e.target.value.split(', ').filter(p => p.trim()) }))}
                  placeholder="Thieves' Tools, Stealth, Perception"
                />
              </div>
            </div>
          </div>

          {/* Backstory */}
          <div className={styles.backstory}>
            <h4>Character Backstory</h4>
            <textarea
              value={character.backstory}
              onChange={(e) => setCharacter(prev => ({ ...prev, backstory: e.target.value }))}
              placeholder="Tell the character's story..."
              rows={4}
              className={styles.backstoryText}
            />
          </div>

          {/* Equipment & Inventory */}
          <div className={styles.equipment}>
            <h4>Equipment & Inventory</h4>
            <textarea
              value={character.equipment.join(', ')}
              onChange={(e) => setCharacter(prev => ({ ...prev, equipment: e.target.value.split(', ').filter(i => i.trim()) }))}
              placeholder="Sword, Shield, Leather Armor, Backpack, 50 gold pieces..."
              rows={3}
            />
          </div>

          {/* Spellcasting (if applicable) */}
          {(character.class === 'Wizard' || character.class === 'Cleric' || character.class === 'Sorcerer' || character.class === 'Warlock' || character.class === 'Bard' || character.class === 'Druid') && (
            <div className={styles.spellcasting}>
              <h4>Spellcasting</h4>
              <div className={styles.spellGrid}>
                <div className={styles.field}>
                  <label>Cantrips</label>
                  <input
                    type="text"
                    value={character.cantrips.join(', ')}
                    onChange={(e) => setCharacter(prev => ({ ...prev, cantrips: e.target.value.split(', ').filter(c => c.trim()) }))}
                    placeholder="Mage Hand, Prestidigitation, Fire Bolt"
                  />
                </div>
                <div className={styles.field}>
                  <label>Spells</label>
                  <textarea
                    value={character.spells.join(', ')}
                    onChange={(e) => setCharacter(prev => ({ ...prev, spells: e.target.value.split(', ').filter(s => s.trim()) }))}
                    placeholder="Magic Missile, Shield, Cure Wounds"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button className={styles.createButton} onClick={handleCreate}>
            Create Character
          </button>
          <button className={styles.cancelButton} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

