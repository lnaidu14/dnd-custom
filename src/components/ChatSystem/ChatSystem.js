import { useState, useEffect } from 'react';
import styles from './ChatSystem.module.css';

export default function ChatSystem({ websocket, campaignId }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
    if (!websocket) return;

    websocket.subscribe('CHAT_MESSAGE', (message) => {
        setMessages(prev => [...prev, message]);
    });


    return () => {
        websocket.unsubscribe?.('CHAT_MESSAGE');
    };
}, [websocket]);


    const sendMessage = () => {
        websocket.send('CHAT_MESSAGE', {
            campaignId,
            content: input,
            timestamp: Date.now()
        });
        setInput('');
    };

    return (
        <div className={styles.chat}>
            <div className={styles.messages}>
                {messages.map((msg, i) => (
                    <div key={i} className={styles.message}>
                        <span>{msg.sender}: {msg.content}</span>
                    </div>
                ))}
            </div>
            <div className={styles.input}>
                <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
}