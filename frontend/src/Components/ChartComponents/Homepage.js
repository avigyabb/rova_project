// Import React and necessary hooks
import '../../styles/SessionCard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import '../../styles/Homepage.css';
import { useNavigate } from 'react-router';

const ModifiedSessionCard = ({ sessionId, userId, timestamp, tags, summary }) => {
  const navigate = useNavigate();
  const handleClick = () => {
      navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId } });
  };

  return (
    <div className="insights-card flex flex-col" onClick={handleClick}>
      <div className="session-tags flex">
        <div className="text-md"> 👤 {userId} </div>
        <div className="text-sm insights-session self-end ml-3"> session {sessionId} </div>
        <div className='ml-5'>
        {tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
        </div>
        <div className="user-updated ml-auto">{timestamp}</div>
      </div>
      <div className='insights-card-content flex'>
          <p className='text-gray-500'> {summary} </p>
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mocking a fetch sessions details function
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-surfaced-sessions/'); // Replace API_ENDPOINT with your actual API endpoin
        console.log(response.data.sessions);
        const sid = "2"
        console.log(response.data.sessions["2"].user_id);
        //setSessions(responses.map(response => response.data));
        // const fakeSessions = generateFakeSessions(sessionIds);
        setSessions(response.data.sessions);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      }
      setLoading(false);
    };

    fetchSessions();
  }, []);

  return (
    <div className='homepage'>
      <h1 className='text-3xl' style={{marginTop: '3%', marginLeft: '3%'}}> Welcome Back! 🎉</h1>
      <p className='header-text text-gray-500'> Here are your important sessions, based on your topics and KPIs: </p>
      <div className='insights-content'>
        {loading ? (
          <div className="sessions-container flex flex-col justify-center items-center mt-56">
            <p className='mb-8 text-gray-500'> Surfacing important user sessions...</p>
            <CircularProgress style={{ color: '#FFA189' }}/>
          </div>
        ) : (
          <div className="sessions-container">
            {Object.keys(sessions).map((session_id) => (
              <ModifiedSessionCard
                key={session_id}
                sessionId={session_id}
                userId={sessions[session_id].user_id}
                timestamp={sessions[session_id].timestamp}
                tags={sessions[session_id].tags}
                summary={sessions[session_id].summary}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;


