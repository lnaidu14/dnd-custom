import { useState, useEffect } from "react";
import { ErrorBoundary, HomeScreen, Session } from "../components";
import { ItemGenerator } from "../services/itemGenerator";
import { LocalAIService } from "../services/aiService";

export default function Home() {
  const [campaign, setCampaign] = useState({
    gridSize: 10,
    tokens: [],
    environmentalObjects: [],
  });
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [actionEconomy, setActionEconomy] = useState({});
  const [isDM, setIsDM] = useState(false); // Will be set based on campaign role
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    playerCount: 0,
    dmPresent: false,
    connectedUsers: [],
  });
  const [currentScene, setCurrentScene] = useState("Empty Scene");
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  // Initialize services
  const aiService = new LocalAIService();
  const itemGenerator = new ItemGenerator(aiService);

  // Real-time sync function
  const syncCampaignState = async () => {
    if (!campaign.id || showHomeScreen) return;

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}`);
      if (response.ok) {
        const campaignData = await response.json();
        if (campaignData.success && campaignData.campaign.gameState) {
          const serverState = campaignData.campaign.gameState;

          // Only update if server state is newer
          if (
            serverState.lastUpdated &&
            serverState.lastUpdated > lastSyncTime
          ) {
            setCampaign((prev) => ({
              ...prev,
              tokens: serverState.tokens || prev.tokens,
              environmentalObjects:
                serverState.environmentalObjects || prev.environmentalObjects,
              currentSceneImage:
                serverState.currentSceneImage || prev.currentSceneImage,
            }));
            setLastSyncTime(Date.now());
            console.log("Campaign state synced from server");
          }
        }
      }
    } catch (error) {
      console.error("Failed to sync campaign state:", error);
    }
  };

  // Real-time polling for campaign updates
  useEffect(() => {
    if (!campaign.id || showHomeScreen) return;

    const interval = setInterval(syncCampaignState, 2000); // Poll every 2 seconds
    return () => clearInterval(interval);
  }, [campaign.id, showHomeScreen, lastSyncTime]);

  // Initialize database via API
  useEffect(() => {
    const initializeDb = async () => {
      try {
        const response = await fetch("/api/database/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const result = await response.json();

        if (result.success) {
          setDbInitialized(true);
          console.log("Database initialized successfully");
        } else {
          console.error("Database initialization failed:", result.error);
        }
      } catch (error) {
        console.error("Database initialization failed:", error);
      }
    };
    initializeDb();
  }, []);

  const handleTokenMove = async (token, newPosition) => {
    setCampaign((prev) => ({
      ...prev,
      tokens: prev.tokens.map((t) =>
        t.id === token.id ? { ...t, ...newPosition } : t
      ),
    }));

    // Save position to database
    if (campaign.id) {
      try {
        const updatedCampaign = {
          ...campaign,
          tokens: campaign.tokens.map((t) =>
            t.id === token.id ? { ...t, ...newPosition } : t
          ),
        };

        await fetch(`/api/campaigns/${campaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: {
              ...updatedCampaign,
              lastUpdated: Date.now(),
            },
          }),
        });

        setLastSyncTime(Date.now()); // Update local sync time
        console.log("Token position saved:", token.name, newPosition);
      } catch (error) {
        console.error("Failed to save token position:", error);
      }
    }
  };

  const handleAction = (actionType, actionData) => {
    console.log("Action performed:", actionType, actionData);
    // Handle different action types here
  };

  const handleInitiativeUpdate = (characterId, initiative) => {
    setCampaign((prev) => ({
      ...prev,
      tokens: prev.tokens.map((token) =>
        token.id === characterId ? { ...token, initiative } : token
      ),
    }));
  };

  // Session management functions
  const updateSessionInfo = async (campaignId, userRole) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "join",
          role: userRole,
          userId: `user_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 5)}`,
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSessionInfo(sessionData);
        return sessionData;
      }
    } catch (error) {
      console.error("Failed to update session info:", error);
    }
    return null;
  };

  const leaveSession = async (campaignId) => {
    try {
      await fetch(`/api/campaigns/${campaignId}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "leave" }),
      });
    } catch (error) {
      console.error("Failed to leave session:", error);
    }
  };

  const handleCharacterUpdate = (updatedCharacter) => {
    setSelectedCharacter(updatedCharacter);
    setCampaign((prev) => ({
      ...prev,
      tokens: prev.tokens.map((t) =>
        t.id === updatedCharacter.id ? updatedCharacter : t
      ),
    }));
  };

  const handleGenerateItem = async (prompt) => {
    try {
      return await itemGenerator.generateItem(prompt);
    } catch (error) {
      console.error("Item generation failed:", error);
      return null;
    }
  };

  const handleCreateCampaign = async () => {
    if (!dbInitialized) {
      alert(
        "Database not initialized yet. Please wait a moment and try again."
      );
      return;
    }

    const campaignName = prompt("Enter campaign name:");
    if (!campaignName) return;

    const campaignDescription =
      prompt("Enter campaign description (optional):") || "";

    const campaignData = {
      name: campaignName,
      description: campaignDescription,
    };

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(campaignData),
      });

      const result = await response.json();

      if (result.success) {
        // Clear any existing scene data
        setCurrentScene(null);
        localStorage.removeItem("current_scene_image");

        setCampaign({
          id: result.campaign.id,
          name: result.campaign.name,
          description: result.campaign.description,
          gridSize: 10,
          tokens: [],
          environmentalObjects: [],
          currentSceneImage: null,
        });
        setShowHomeScreen(false);
        setIsDM(true);

        // Update session info for DM
        await updateSessionInfo(result.campaign.id, "dm");

        console.log("Campaign created:", result.campaign);
      } else {
        alert(result.error || "Failed to create campaign");
      }
    } catch (error) {
      console.error("Failed to create campaign:", error);
      alert("Failed to create campaign. Please try again.");
    }
  };

  const handleJoinCampaign = async (campaignId = null, asPlayer = false) => {
    if (!dbInitialized) {
      alert(
        "Database not initialized yet. Please wait a moment and try again."
      );
      return;
    }

    if (!campaignId) {
      // Ask for campaign name to join as player
      const campaignName = prompt("Enter the campaign name to join:");
      if (!campaignName) return;

      try {
        const response = await fetch("/api/campaigns/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignName }),
        });

        const result = await response.json();

        if (!result.success) {
          let errorMessage =
            result.message || result.error || "Campaign not found";
          if (
            result.availableCampaigns &&
            result.availableCampaigns.length > 0
          ) {
            errorMessage += `\n\nAvailable campaigns:\n${result.availableCampaigns.join(
              "\n"
            )}`;
          }
          alert(errorMessage);
          return;
        }

        const campaignData = result.campaign;
        console.log("campaignData: ", result);

        // Set as current campaign with full game state
        const fullCampaignState = {
          id: campaignData.id,
          name: campaignData.name,
          description: campaignData.description,
          gridSize: 10,
          tokens: [],
          environmentalObjects: [],
          ...campaignData.gameState, // This should override with saved state,
        };

        setCampaign(fullCampaignState);
        console.log("Loaded campaign state:", fullCampaignState);

        setShowHomeScreen(false);
        setIsDM(false); // Always false when joining by name (players)

        // Check session info and join as player
        const sessionData = await updateSessionInfo(campaignData.id, "player");
        if (sessionData && sessionData.dmPresent === false) {
          alert(
            "No DM is currently in this session. You may need to wait for the DM to join."
          );
        }

        // Auto-select player character if available
        setTimeout(() => {
          const playerCharacters = (fullCampaignState.tokens || []).filter(
            (token) => token.isPlayer
          );

          if (playerCharacters.length > 0) {
            // Auto-select their character
            setSelectedCharacter(playerCharacters[0]);
            console.log(
              "Auto-selected player character:",
              playerCharacters[0].name
            );
          } else {
            // No character available - DM needs to create one
            alert(
              "Welcome to the campaign! Please wait for the DM to create your character, or ask them to assign you one."
            );
          }
        }, 500);

        console.log("Joined campaign as player:", campaignData);
        return;
      } catch (error) {
        console.error("Failed to join campaign:", error);
        alert("Failed to join campaign. Please try again.");
        return;
      }
    }

    try {
      // Load campaign data
      const response = await fetch(`/api/campaigns/${campaignId}`);
      const result = await response.json();

      if (!result.success) {
        alert("Campaign not found.");
        return;
      }

      const campaignData = result.campaign;

      // Set as current campaign
      setCampaign((prev) => ({
        ...prev,
        id: campaignData.id,
        name: campaignData.name,
        description: campaignData.description,
        ...(campaignData.gameState || {}),
      }));

      setShowHomeScreen(false);
      setIsDM(!asPlayer); // Set DM status based on how they joined
      console.log(
        `Joined campaign as ${asPlayer ? "player" : "DM"}:`,
        campaignData
      );
    } catch (error) {
      console.error("Failed to join campaign:", error);
      alert("Failed to join campaign. Please try again.");
    }
  };

  const handleDeleteCampaign = async (campaignId) => {
    try {
      const response = await fetch(
        `/api/campaigns/delete?campaignId=${campaignId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        alert("Campaign deleted successfully");
        // Refresh the home screen to update the campaign list
        window.location.reload();
      } else {
        alert(result.error || "Failed to delete campaign");
      }
    } catch (error) {
      console.error("Failed to delete campaign:", error);
      alert("Failed to delete campaign. Please try again.");
    }
  };

  const handleBackToHome = async () => {
    // Leave session when going back to home
    if (campaign.id) {
      await leaveSession(campaign.id);
    }

    setCampaign({
      gridSize: 10,
      tokens: [],
      environmentalObjects: [],
    });
    setSelectedCharacter(null);
    setActiveTab("board");
    setSessionInfo({
      playerCount: 0,
      dmPresent: false,
      connectedUsers: [],
    });
    setShowHomeScreen(true);
  };

  const handleCharacterCreate = async (character) => {
    setCampaign((prev) => ({
      ...prev,
      tokens: [...prev.tokens, character],
    }));

    // Save campaign state to database
    if (campaign.id) {
      try {
        const updatedCampaign = {
          ...campaign,
          tokens: [...campaign.tokens, character],
        };

        await fetch(`/api/campaigns/${campaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: updatedCampaign,
          }),
        });

        console.log("Character saved to campaign:", character.name);
      } catch (error) {
        console.error("Failed to save character to campaign:", error);
      }
    }

    setSelectedCharacter(character);
  };

  const handleInitiativeChange = (characterId, initiative) => {
    setCampaign((prev) => ({
      ...prev,
      tokens: prev.tokens.map((token) =>
        token.id === characterId ? { ...token, initiative } : token
      ),
    }));
  };

  const handleLoadScene = async (scene) => {
    // Reset environmental objects to only the new scene's objects
    const sceneObjects = (scene.objects || []).map((obj) => ({
      ...obj,
      id: `${obj.type}-${obj.x}-${obj.y}-${Date.now()}`,
    }));

    // Add scene NPCs to tokens
    const sceneNPCs = scene.npcs || [];

    setCampaign((prev) => ({
      ...prev,
      environmentalObjects: sceneObjects, // Replace, don't add to existing
      tokens: [...prev.tokens.filter((token) => !token.isNPC), ...sceneNPCs], // Replace NPCs, keep players
      currentSceneImage: scene.imageUrl || null, // Store scene image URL
    }));
    setCurrentScene(scene.name);

    // Save scene state to database so players can see it
    if (campaign.id) {
      try {
        await fetch(`/api/campaigns/${campaign.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameState: {
              ...campaign,
              environmentalObjects: sceneObjects,
              currentScene: scene.name,
              currentSceneImage:
                scene.imageUrl || localStorage.getItem("current_scene_image"),
            },
          }),
        });
        console.log("Scene synced to database for all players");
      } catch (error) {
        console.error("Failed to sync scene:", error);
      }
    }

    console.log("Scene loaded:", scene.name, "Objects:", sceneObjects.length);
  };

  if (showHomeScreen) {
    return (
      <ErrorBoundary>
        <HomeScreen
          onCreateCampaign={handleCreateCampaign}
          onJoinCampaign={handleJoinCampaign}
          onDeleteCampaign={handleDeleteCampaign}
          dbInitialized={dbInitialized}
        />
      </ErrorBoundary>
    );
  }

  return (
    <Session
      campaign={campaign}
      isDM={isDM}
      sessionInfo={sessionInfo}
      selectedCharacter={selectedCharacter}
      setSelectedCharacter={setSelectedCharacter}
      currentScene={currentScene}
      handleTokenMove={handleTokenMove}
      handleAction={handleAction}
      handleCharacterUpdate={handleCharacterUpdate}
      handleLoadScene={handleLoadScene}
      handleInitiativeUpdate={handleInitiativeUpdate}
      handleCharacterCreate={handleCharacterCreate}
      handleGenerateItem={handleGenerateItem}
      handleBackToHome={handleBackToHome}
    />
  );
}
