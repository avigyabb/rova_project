import React, { useState, useEffect } from 'react';
import '../../styles/SessionCard.css'; // Make sure to create this CSS file
import { useNavigate } from 'react-router';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

const SessionCard = ({ sessionId, userId, timestamp }) => {

    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId } });
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
