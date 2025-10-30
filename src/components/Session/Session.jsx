import React, { useState } from "react";
import ErrorBoundary from "../ErrorBoundary/ErrorBoundary";
import Board from "../Board/Board";
import InteractiveDiceRoller from "../DiceRoller/InteractiveDiceRoller";
import CharacterSheet from "../CharacterSheet/CharacterSheet";
import Inventory from "../Inventory/Inventory";
import SceneManager from "../SceneManager/SceneManager";
import InitiativeTracker from "../InitiativeTracker/InitiativeTracker";
import QuickCharacterCreator from "../CharacterCreator/QuickCharacterCreator";
import MusicPlayer from "../AudioPlayer/MusicPlayer";

export default function Session({
  campaign,
  isDM,
  sessionInfo,
  selectedCharacter,
  setSelectedCharacter,
  currentScene,
  handleTokenMove,
  handleAction,
  handleCharacterUpdate,
  handleLoadScene,
  handleInitiativeUpdate,
  handleCharacterCreate,
  handleGenerateItem,
  handleBackToHome,
}) {
  // Session-specific state
  const [activeTab, setActiveTab] = useState("board");
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);

  return (
    <>
      <div>
        {/* Campaign Header */}
        <div
          style={{
            padding: "1rem",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            {/* Top row: Session status + role */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              {/* Session Active capsule with circle inside */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  background: "var(--primary)",
                  color: "white",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: sessionInfo.active ? "limegreen" : "red",
                    transition: "background-color 0.3s ease",
                  }}
                />
                Session Active
              </span>

              {/* Role badge */}
              <span
                style={{
                  fontSize: "0.8rem",
                  background: "var(--primary)",
                  color: "white",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.25rem",
                }}
              >
                {isDM ? "Dungeon Master" : "Player"}
              </span>
            </div>

            {/* Campaign name below indicators */}
            <h1 style={{ margin: 0, color: "var(--text)" }}>
              Campaign name: {campaign.name || "Unnamed Campaign"}
            </h1>

            {/* Campaign description (if present) */}
            {campaign.description && (
              <p
                style={{
                  margin: "0.25rem 0 0 0",
                  color: "var(--text-secondary, #999)",
                }}
              >
                Description: {campaign.description}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {isDM && (
              <button
                onClick={() => setShowCharacterCreator(true)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  marginRight: "0.5rem",
                }}
              >
                Add Character
              </button>
            )}
            <button
              onClick={handleBackToHome}
              style={{
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
            >
              Back to Home
            </button>
          </div>
        </div>

        <ErrorBoundary>
          <main
            style={{
              display: "flex",
              gap: "1rem",
              height: "calc(100vh - 4rem)",
            }}
          >
            <div style={{ flex: 1 }}>
              {/* Tab Navigation */}
              <div style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {["board", "characters", "inventory"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "0.5rem 1rem",
                        background:
                          activeTab === tab ? "var(--primary)" : "transparent",
                        color: activeTab === tab ? "white" : "var(--text)",
                        border: "none",
                        borderBottom:
                          activeTab === tab
                            ? "2px solid var(--primary)"
                            : "2px solid transparent",
                        cursor: "pointer",
                        textTransform: "capitalize",
                      }}
                    >
                      {tab === "characters"
                        ? "Characters"
                        : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === "board" && (
                <>
                  <ErrorBoundary>
                    <Board
                      campaign={campaign}
                      onTokenMove={handleTokenMove}
                      onAction={handleAction}
                      isDM={isDM}
                      currentScene={currentScene}
                    />
                  </ErrorBoundary>

                  <ErrorBoundary>
                    <InteractiveDiceRoller
                      character={selectedCharacter}
                      availableCharacters={campaign.tokens || []}
                      onRoll={(result) => console.log("Dice rolled:", result)}
                    />
                  </ErrorBoundary>
                </>
              )}

              {activeTab === "characters" && (
                <div>
                  <h3>{isDM ? "Characters & NPCs" : "Your Character"}</h3>

                  {/* Character List for DM */}
                  {isDM && (
                    <div style={{ marginBottom: "1rem" }}>
                      <h4>All Characters in Campaign:</h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(200px, 1fr))",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {campaign.tokens.map((token) => (
                          <div
                            key={token.id}
                            style={{
                              padding: "1rem",
                              border:
                                selectedCharacter?.id === token.id
                                  ? "2px solid var(--primary)"
                                  : "1px solid var(--border)",
                              borderRadius: "0.5rem",
                              cursor: "pointer",
                              background: "var(--surface)",
                              transition: "all 0.2s ease",
                            }}
                            onClick={() => setSelectedCharacter(token)}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {/* Character Icon/Avatar */}
                              {token.aiIcon || token.customIcon ? (
                                <img
                                  src={token.aiIcon || token.customIcon}
                                  alt={token.name}
                                  style={{
                                    width: "3rem",
                                    height: "3rem",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    border: "2px solid var(--border)",
                                  }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "3rem",
                                    height: "3rem",
                                    borderRadius: "50%",
                                    background: token.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "1.2rem",
                                  }}
                                >
                                  {token.label ||
                                    token.name?.charAt(0)?.toUpperCase()}
                                </div>
                              )}
                              <div style={{ flex: 1 }}>
                                <div
                                  style={{
                                    fontWeight: "bold",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  {token.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {token.race} {token.class || "NPC"} - Level{" "}
                                  {token.level || 1}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  HP: {token.hp || 0}/
                                  {token.maxHp || token.hp || 0} | AC:{" "}
                                  {token.ac || 10}
                                </div>
                              </div>
                              {isDM && (
                                <div style={{ fontSize: "0.7rem" }}>
                                  <span
                                    style={{
                                      background: token.isPlayer
                                        ? "var(--accent)"
                                        : "var(--primary)",
                                      color: "white",
                                      padding: "0.2rem 0.4rem",
                                      borderRadius: "0.2rem",
                                    }}
                                  >
                                    {token.isPlayer ? "Player" : "NPC"}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Character Sheet */}
                  {selectedCharacter ? (
                    <ErrorBoundary>
                      <CharacterSheet
                        character={selectedCharacter}
                        onUpdate={handleCharacterUpdate}
                        isEditable={isDM}
                      />
                    </ErrorBoundary>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {isDM
                        ? "Select a character or NPC from above to view details"
                        : "Create a character to view your character sheet"}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "inventory" && (
                <ErrorBoundary>
                  <Inventory
                    character={selectedCharacter}
                    onUpdate={handleCharacterUpdate}
                    onGenerateItem={handleGenerateItem}
                  />
                </ErrorBoundary>
              )}
            </div>

            <div style={{ width: "300px" }}>
              {isDM && (
                <ErrorBoundary>
                  <SceneManager
                    onLoadScene={handleLoadScene}
                    currentScene={currentScene}
                  />
                </ErrorBoundary>
              )}

              <ErrorBoundary>
                <InitiativeTracker
                  characters={campaign.tokens}
                  onInitiativeChange={handleInitiativeUpdate}
                  isDM={isDM}
                />
              </ErrorBoundary>
            </div>
          </main>
        </ErrorBoundary>

        {/* Character Creator Modal */}
        {showCharacterCreator && (
          <ErrorBoundary>
            <QuickCharacterCreator
              onCharacterCreate={(character) => {
                handleCharacterCreate(character);
                setShowCharacterCreator(false);
              }}
              onCancel={() => setShowCharacterCreator(false)}
              isDM={isDM}
            />
          </ErrorBoundary>
        )}
      </div>
    </>
  );
}
