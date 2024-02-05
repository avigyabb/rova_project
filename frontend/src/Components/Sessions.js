import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import SessionSearch from './SessionComponents/SessionSearch';
import CircularProgress from '@mui/material/CircularProgress';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/get-sessions/');
        setSessions(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <SessionSearch setSessions={setSessions} setIsLoading={setIsLoading}/>
      { isLoading ? (
        <div className="min-h-80 flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      ) : (
        <div className='overflow-auto' style={{ height: 'calc(100vh - 180px)' }}>
          {sessions.map(({ session_id, user_id, earliest_timestamp }) => (
            <SessionCard 
            key={session_id} 
            sessionId={session_id} // Pass the session count here
            userId={user_id}
            timestamp={earliest_timestamp}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;