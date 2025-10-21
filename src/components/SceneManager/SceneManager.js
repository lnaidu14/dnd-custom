import { useState, useEffect } from 'react';
import styles from './SceneManager.module.css';
import { LocalAIService } from '../../services/aiService';


export default function SceneManager({ onLoadScene, currentScene }) {
  const [selectedScene, setSelectedScene] = useState(null);
  const [customSceneInput, setCustomSceneInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedScenes, setSavedScenes] = useState([]);
  const aiService = new LocalAIService();

  // Load saved scenes from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_scenes') || '[]');
    setSavedScenes(saved);
  }, []);

  const handleLoadScene = async (scene) => {
    if (onLoadScene) {
      onLoadScene(scene);
    }
    setSelectedScene(scene.id);
    
    // Generate image for preset scenes if not already generated
    if (scene.id !== 'custom' && !scene.id.startsWith('custom-')) {
      const sceneKey = `scene_image_${scene.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const existingImage = localStorage.getItem(sceneKey);
      
      if (!existingImage) {
        try {
          await generateSceneImage(scene.description, scene.name);
        } catch (error) {
          console.warn('Failed to generate image for preset scene:', error);
        }
      } else {
        // Set as current scene image
        localStorage.setItem('current_scene_image', existingImage);
      }
    }
  };

  const saveScene = (scene) => {
    try {
      // Limit to last 5 scenes to prevent quota issues
      const limitedScenes = savedScenes.slice(-4); // Keep last 4, add 1 new = 5 total
      const updatedScenes = [...limitedScenes, scene];
      
      setSavedScenes(updatedScenes);
      localStorage.setItem('saved_scenes', JSON.stringify(updatedScenes));
      console.log('Scene saved successfully:', scene.name);
    } catch (quotaError) {
      console.warn('Failed to save scene due to quota, clearing old scenes');
      // Clear all saved scenes and try again with just this one
      const singleScene = [scene];
      setSavedScenes(singleScene);
      try {
        localStorage.setItem('saved_scenes', JSON.stringify(singleScene));
      } catch (e) {
        console.error('Still cannot save scene, skipping save');
      }
    }
  };

  const deleteScene = (sceneId) => {
    const updatedScenes = savedScenes.filter(scene => scene.id !== sceneId);
    setSavedScenes(updatedScenes);
    localStorage.setItem('saved_scenes', JSON.stringify(updatedScenes));
    
    // Also remove the scene image
    const sceneToDelete = savedScenes.find(s => s.id === sceneId);
    if (sceneToDelete) {
      const sceneKey = `scene_image_${sceneToDelete.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
      localStorage.removeItem(sceneKey);
    }
  };

  const handleClearScene = () => {
    if (onLoadScene) {
      onLoadScene({ id: 'empty', name: 'Empty', objects: [] });
    }
    setSelectedScene('empty');
    // Clear current scene image
    localStorage.removeItem('current_scene_image');
  };

  const generateCustomScene = async () => {
    if (!customSceneInput.trim()) return;
    
    setIsGenerating(true);
    try {
      // Generate scene layout with AI
      const prompt = `Create a D&D scene for: "${customSceneInput}". 
      Return ONLY a valid JSON object with:
      {
        "name": "Scene name",
        "description": "Brief description", 
        "objects": [{"type": "tree", "x": 2, "y": 3, "icon": "🌳"}]
      }
      
      Available types: tree🌳, rock🪨, door🚪, chest📦, fire🔥, water💧, trap⚠️, altar⛩️, table🪑, bar🍺, torch🕯️, wall🧱, bush🌿
      Use x,y coordinates 0-9. Place 3-8 objects strategically.`;
      
      console.log('Generating scene for:', customSceneInput);
      const response = await aiService.generateText(prompt);
      console.log('AI Response:', response);
      
      let sceneData;
      try {
        // Try to extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          sceneData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.warn('Failed to parse AI response, using fallback');
        // Create a simple fallback scene
        sceneData = {
          name: customSceneInput,
          description: `A ${customSceneInput.toLowerCase()} scene`,
          objects: [
            { type: 'tree', x: 2, y: 2, icon: '🌳' },
            { type: 'rock', x: 6, y: 4, icon: '🪨' },
            { type: 'chest', x: 8, y: 7, icon: '📦' }
          ]
        };
      }

      const customScene = {
        id: 'custom-' + Date.now(),
        name: sceneData.name || customSceneInput,
        description: sceneData.description || `Custom scene: ${customSceneInput}`,
        objects: sceneData.objects || [],
        isAIGenerated: true // Mark as AI generated for icon generation
      };

      // Generate scene image with Stable Diffusion
      try {
        const sceneImageUrl = await generateSceneImage(customSceneInput, customScene.name);
        customScene.imageUrl = sceneImageUrl;
      } catch (imageError) {
        console.warn('Image generation failed:', imageError);
        // Continue without image
      }
      
      // Generate AI icons for objects if this is an AI-generated scene
      if (customScene.isAIGenerated && customScene.objects.length > 0) {
        try {
          await generateObjectIcons(customScene.objects);
        } catch (iconError) {
          console.warn('Object icon generation failed:', iconError);
        }
      }
      
      // Generate NPCs for the scene
      try {
        const npcs = await generateSceneNPCs(customSceneInput, customScene.name);
        customScene.npcs = npcs;
      } catch (npcError) {
        console.warn('NPC generation failed:', npcError);
      }
      
      // Save the generated scene
      saveScene(customScene);
      
      handleLoadScene(customScene);
      setCustomSceneInput('');
      console.log('Scene generated successfully:', customScene);
    } catch (error) {
      console.error('Scene generation failed:', error);
      alert('Scene generation failed. Try again or use a preset.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSceneNPCs = async (sceneDescription, sceneName) => {
    try {
      const npcPrompt = `Generate 1-3 NPCs for this D&D scene: "${sceneDescription}".
      Return ONLY valid JSON array:
      [
        {
          "name": "NPC Name",
          "role": "Tavern Keeper",
          "class": "Commoner",
          "race": "Human",
          "level": 1,
          "str": 10, "dex": 10, "con": 10, "int": 10, "wis": 10, "cha": 12,
          "hp": 8, "ac": 10, "movementSpeed": 30,
          "description": "Brief description"
        }
      ]
      
      Make NPCs appropriate for the scene. Taverns have keepers, forests have rangers, dungeons have guards.`;
      
      const response = await aiService.generateText(npcPrompt);
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const npcs = JSON.parse(jsonMatch[0]);
        return npcs.map(npc => ({
          ...npc,
          id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isPlayer: false,
          isNPC: true,
          x: Math.floor(Math.random() * 10),
          y: Math.floor(Math.random() * 10),
          color: `hsl(${Math.random() * 360}, 70%, 50%)`
        }));
      }
      return [];
    } catch (error) {
      console.error('NPC generation failed:', error);
      return [];
    }
  };

  const generateObjectIcons = async (objects) => {
    for (const obj of objects) {
      try {
        const iconPrompt = `D&D ${obj.type} icon, top-down view, game asset style, clean background, high contrast, fantasy RPG, 64x64 pixel style`;
        
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
            // Store object icon
            const iconKey = `object_icon_${obj.type}`;
            localStorage.setItem(iconKey, result.image);
            obj.aiIcon = result.image; // Add AI icon to object
            console.log('Generated AI icon for:', obj.type);
          }
        }
      } catch (error) {
        console.warn(`Failed to generate icon for ${obj.type}:`, error);
      }
    }
  };

  const generateSceneImage = async (sceneDescription, sceneName) => {
    try {
      // Create more specific prompts based on scene type
      let imagePrompt = '';
      const lowerScene = sceneDescription.toLowerCase();
      
      if (lowerScene.includes('tavern')) {
        imagePrompt = `D&D tavern interior, top-down battle map view, wooden tables and chairs, bar counter, fireplace, indoor scene, no people, clean tactical grid layout, fantasy RPG style`;
      } else if (lowerScene.includes('forest')) {
        imagePrompt = `D&D forest clearing, top-down battle map view, trees scattered around, forest floor, natural terrain, no people, tactical grid layout, fantasy RPG style`;
      } else if (lowerScene.includes('dungeon')) {
        imagePrompt = `D&D dungeon interior, top-down battle map view, stone corridors, dungeon rooms, torches on walls, no people, tactical grid layout, fantasy RPG style`;
      } else if (lowerScene.includes('dragon') && lowerScene.includes('lair')) {
        imagePrompt = `D&D dragon lair interior, top-down battle map view, cave chamber, treasure piles, rocky terrain, lava pools, no people, tactical grid layout, fantasy RPG style`;
      } else {
        // For custom scenes, extract key elements and simplify
        const keywords = sceneDescription.toLowerCase();
        if (keywords.includes('steampunk') || keywords.includes('piltover')) {
          imagePrompt = `steampunk tavern interior, top-down battle map view, brass pipes, copper fixtures, wooden tables, mechanical devices, indoor scene, no people`;
        } else if (keywords.includes('market') || keywords.includes('square')) {
          imagePrompt = `medieval market square, top-down battle map view, market stalls, cobblestone ground, fountain center, no people`;
        } else {
          // Generic fallback - extract first few words
          const firstWords = sceneDescription.split(' ').slice(0, 3).join(' ');
          imagePrompt = `D&D ${firstWords}, top-down battle map view, simple layout, tactical terrain`;
        }
      }
      
      imagePrompt += `, battle map style, tabletop RPG, grid-based, no characters, no people, no text, no emojis, no symbols, clean tactical view, flat perspective`;
      
      // Use centralized AI API
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
            // Clear old scene images to prevent quota issues
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.startsWith('scene_image_')) {
                keysToRemove.push(key);
              }
            }
            // Keep only the last 3 scene images
            if (keysToRemove.length > 3) {
              keysToRemove.slice(0, -3).forEach(key => localStorage.removeItem(key));
            }
            
            // Store the new image
            const sceneKey = `scene_image_${sceneName.replace(/[^a-zA-Z0-9]/g, '_')}`;
            localStorage.setItem(sceneKey, result.image);
            localStorage.setItem('current_scene_image', result.image);
            console.log('Scene image generated successfully for:', sceneName);
            return result.image; // Return the image URL
          } catch (quotaError) {
            console.warn('localStorage quota exceeded, clearing old images');
            // Clear all scene images and try again
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('scene_image_')) {
                localStorage.removeItem(key);
              }
            });
            try {
              localStorage.setItem('current_scene_image', result.image);
            } catch (e) {
              console.error('Still cannot store image, skipping storage');
            }
          }
        }
      }
    } catch (error) {
      console.error('Image generation failed:', error);
      throw error;
    }
  };

  return (
    <div className={styles.container}>
      <h3>Scene Manager</h3>
      <p className={styles.description}>
        Quickly set up different environments for your adventure
      </p>


      <div className={styles.customScene}>
        <h4>AI Scene Generator</h4>
        <div className={styles.customInput}>
          <input
            type="text"
            placeholder="e.g., 'League of Legends Rift', 'Pirate ship deck', 'Magical library'"
            value={customSceneInput}
            onChange={(e) => setCustomSceneInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && generateCustomScene()}
            disabled={isGenerating}
          />
          <button 
            onClick={generateCustomScene}
            disabled={isGenerating || !customSceneInput.trim()}
            className={styles.generateButton}
          >
            {isGenerating ? '🤖 Generating...' : '✨ Generate'}
          </button>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          className={styles.clearButton}
          onClick={handleClearScene}
        >
          Clear Scene
        </button>
      </div>

      {currentScene && (
        <div className={styles.currentScene}>
          <strong>Current Scene:</strong> {currentScene}
        </div>
      )}
    </div>
  );
}
