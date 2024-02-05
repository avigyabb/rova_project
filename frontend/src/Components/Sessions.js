import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import SessionSearch from './SessionComponents/SessionSearch';
import CircularProgress from '@mui/material/CircularProgress';

const Sessions = () => {
  // Placeholder data - replace with your actual data fetching logic
  const [sessionIds, setSessionIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/get-sessions/');
        setSessionIds(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Effect to log `sesh` on updates CAN DELETE WHEN DONE - what is this?
  useEffect(() => {
    if (sessionIds !== undefined) {
      console.log(sessionIds);
    }
  }, [sessionIds]);

  return (
    <div className="container mx-auto p-4">
      <SessionSearch setSessionIds={setSessionIds} setIsLoading={setIsLoading}/>
      { isLoading ? (
        <div className="min-h-80 flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      ) : (
        <div className='overflow-auto' style={{ height: 'calc(100vh - 180px)' }}>
          {sessionIds.map((sessionId) => (
            <SessionCard 
            key={sessionId} 
            sessionId={sessionId} // Pass the session count here
          />
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;