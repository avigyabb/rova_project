// Import React and necessary hooks
import '../../styles/SessionCard.css';
import React, { useState, useEffect, useNavigate } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import '../../styles/Homepage.css';

const ModifiedSessionCard = ({ sessionId, userId, timestamp, tags, summary }) => {
  // Function to handle card click (assuming navigation logic remains the same)
  // const navigate = useNavigate();
  // const handleClick = () => {
  //   navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId } });
  // };

  return (
    <div className="session-card">
      <div className="session-info">
        <div className="session-name">Session: {sessionId}</div>
        <div className="session-timestamp">Time: {timestamp}</div>
      </div>
      <div className="session-user">
        <div className="user-id">User: {userId}</div>
      </div>
      <div className="session-summary">
        <p>{summary}</p>
      </div>
      <div className="session-tags">
        {tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

const generateFakeSessions = () => {
  const sessionIds = ['session1', 'session2', 'session3', 'session4', 'session5', 'session6'];
  return sessionIds.map((id, index) => ({
    sessionId: id,
    userId: `user${index + 1}`,
    timestamp: new Date().toISOString(),
    tags: [`tag1-${index}`, `tag2-${index}`],
    summary: `This is a summary for session ${id}. It contains some details about the session's purpose and outcomes.`
  }));
};

const Homepage = ({ sessionIds }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking a fetch sessions details function
    const fetchSessions = async () => {
      try {
        setLoading(false);
        // const responses = await Promise.all(sessionIds.map(id =>
        //   axios.get(`API_ENDPOINT/sessions/${id}`) // Replace API_ENDPOINT with your actual API endpoint
        // ));
        //setSessions(responses.map(response => response.data));
        const fakeSessions = generateFakeSessions(sessionIds);
        setSessions(fakeSessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <div className="sessions-container" style={{ width: '130%' }}>
      {sessions.map((session) => (
        <ModifiedSessionCard
          key={session.sessionId}
          sessionId={session.sessionId}
          userId={session.userId}
          timestamp={session.timestamp}
          tags={session.tags}
          summary={session.summary}
        />
      ))}
    </div>
  );
};

export default Homepage;


