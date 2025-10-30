import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import styles from "./HomeScreen.module.css";

export default function HomeScreen({ onCreateCampaign, onJoinCampaign, onDeleteCampaign }) {
  const { colors } = useTheme();
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [activeTab, setActiveTab] = useState('dm'); // 'dm' or 'player'

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns/list');
        const result = await response.json();
        if (result.success) {
          console.log("campaign data: ", result)
          setRecentCampaigns(result.campaigns);
          // For now, active sessions are the same as recent campaigns
          // In a real app, you'd filter for currently active ones
          setActiveSessions(result.campaigns);
        }
      } catch (error) {
        console.error('Failed to load campaigns:', error);
      }
    };
    loadCampaigns();
  }, []);

  return (
    <div
      className={`${styles.container} bg-background min-h-screen p-4 md:p-6`}
    >
      <header className={styles.header}>
        <h1 className={`${styles.title} text-2xl md:text-4xl`}>
          Welcome to DnD Custom
        </h1>
      </header>

      {/* Tab Navigation */}
      <div className={styles.tabNav}>
        <button
          className={`${styles.tab} ${
            activeTab === "dm" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("dm")}
        >
          🎲 Dungeon Master
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "player" ? styles.activeTab : ""
          }`}
          onClick={() => setActiveTab("player")}
        >
          ⚔️ Player
        </button>
      </div>

      {/* DM Tab */}
      {activeTab === "dm" && (
        <div className={styles.tabContent}>
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={onCreateCampaign}
            >
              Create New Campaign
            </button>
          </div>

          {recentCampaigns.length > 0 && (
            <section className={styles.recent}>
              <h2>Active Campaigns</h2>
              <div className={styles.campaignGrid}>
                {recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className={styles.campaignCard}>
                    <h3>{campaign.name}</h3>
                    <p>{campaign.description || "No description"}</p>
                    <small>
                      Created:{" "}
                      {new Date(campaign.created_at).toLocaleDateString()}
                    </small>
                    <div className={styles.campaignActions}>
                      <button
                        className={styles.resumeButton}
                        onClick={() => onJoinCampaign(campaign.id, false)} // false = not as player (so as DM)
                      >
                        Resume as DM
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete "${campaign.name}"? This cannot be undone.`
                            )
                          ) {
                            onDeleteCampaign(campaign.id);
                          }
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Player Tab */}
      {activeTab === "player" && (
        <div className={styles.tabContent}>
          <div className={styles.instructions}>
            <h3>Join an Active Campaign</h3>
            <p>
              Ask your DM for the campaign name, then click on it below to join:
            </p>
          </div>

          {activeSessions.length > 0 ? (
            <section className={styles.recent}>
              <h2>Active Sessions</h2>
              <div className={styles.campaignGrid}>
                {activeSessions.map((session) => (
                  <div key={session.id} className={styles.campaignCard}>
                    <div>
                      <h3>{session.name}</h3>
                      <p>{session.description || "No description"}</p>
                      <small>DM's Campaign</small>
                    </div>
                    <div>
                      <button
                        className={styles.joinButton}
                        onClick={() => onJoinCampaign(session.id, true)} // true = as player
                      >
                        Join as Player
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className={styles.noSessions}>
              <p>No active sessions found. Ask your DM to create a campaign!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
