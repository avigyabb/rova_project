import React, { useState, useEffect } from 'react';
import '../../styles/SessionCard.css'; // Make sure to create this CSS file
import { useNavigate } from 'react-router';

const SessionCard = ({ sessionId, userId, timestamp, index, sessionList, categoryList, onSessionClick, selectMode, selectedSessions }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (selectMode) {
      onSessionClick();
    } else {
      navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId, index, sessionList } });
    }
  };

  const isInSessionList = selectedSessions.some(s => s.session_id === sessionId);

  return (
    <div className="user-card" onClick={handleClick} style={{ backgroundColor: isInSessionList && '#DBECF6' }}>
      <div className="category-tags">
        {categoryList.map((category, index) => (
            <div key={index} className="category-tag">
                {category}
            </div>
        ))}
      </div>
      <div className="user-card-content">
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
    </div>
  );
};
  
export default SessionCard;
