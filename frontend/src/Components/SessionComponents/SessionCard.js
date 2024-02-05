import React, { useState, useEffect } from 'react';
import '../../styles/SessionCard.css'; // Make sure to create this CSS file
import { useNavigate } from 'react-router';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

const SessionCard = ({ sessionId }) => {

    const [sessionData, setSessionData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          const params = {
            session_id:sessionId,
          };
          const response = await axios.get('http://localhost:8000/get-session-data/', { params });
          setSessionData(response.data.session_data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []);

    if (isLoading) {
      return <CircularProgress />;
    }

    const handleClick = () => {
       navigate(`/trace/${sessionData.user_id}`, { state: { sessionData, sessionId } });
    };
    return (
      <div className="user-card" onClick={handleClick}>
        <div className="user-info">
          <div className="user-name">User: {sessionData.user_id}</div>
        </div>
        <div className="session-info">
          <div className="user-name">Session {sessionId}</div>
        </div>
        <div className="user-meta">
          <div className="user-updated">Time: {sessionData.timestamp}</div>
        </div>
      </div>
    );
  };
  
  export default SessionCard;
