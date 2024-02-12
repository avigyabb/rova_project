import React, { useState, useEffect } from 'react';
import '../../styles/SessionCard.css'; // Make sure to create this CSS file
import { useNavigate } from 'react-router';

const SessionCard = ({ sessionId, userId, timestamp, index, sessionList }) => {

    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId, index, sessionList } });
    };
    return (
      <div className="user-card" onClick={handleClick}>
        <div className="user-info">
          <div className="user-name">👤 {userId}</div>
        </div>
        <div className="session-info">
          <div className="user-name">⏲️ Session {sessionId}</div>
        </div>
        <div className="user-meta">
          <div className="user-updated">Time: {timestamp}</div>
        </div>
      </div>
    );
  };
  
  export default SessionCard;
