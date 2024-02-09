import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import '../styles/SessionSearch.css';

import SessionSearch from './SessionComponents/SessionSearch';
import CircularProgress from '@mui/material/CircularProgress';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlBox, setSqlBox] = useState(`SELECT *\nFROM (\nSELECT session_id FROM rova_dev.llm\nUNION DISTINCT\nSELECT session_id FROM rova_dev.product\n)\nLIMIT 50\n`);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const params = {
          sql: sqlBox
        };
        console.log(process.env.REACT_APP_API_URL + 'get-sessions/'); // dont delete for now
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions/', { params });
        setSessions(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSqlChange = (event) => {
    // Update the sqlQuery state with the new value from the textarea
    setSqlBox(event.target.value);
  };
  
  const handleSqlQuery = (event) => {
    // Listen for command + enter key press
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      
      setIsLoading(true);
  
      const fetchSqlResponse = async () => {
        try {
          const params = {
            sql: sqlBox
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions/', { params });
          setSessions(response.data.sessions);
          setIsLoading(false);
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchSqlResponse();
    }
  };

  return (
    <div className="flex flex-col items-center h-screen">
      <SessionSearch setSessions={setSessions} setIsLoading={setIsLoading} setSqlBox={setSqlBox}/>
        <div className='main-content flex'>
          <div className='sql-col'>
            <div className='sql-header'> sql (cmd + enter to run) </div>
            {sqlBox ? (
              <textarea
                className="sql-response"
                value={sqlBox}
                placeholder="Write your SQL query here..."
                spellCheck="false"
                onChange={handleSqlChange}
                onKeyDown={handleSqlQuery}
              />
            ) : (
              <div className="sql-response flex justify-center items-center">
                <CircularProgress style={{ color: '#FFA189' }}/>
              </div>
            )}
          </div>
          { !isLoading ? (
            <div className='sessions-list'>
              {sessions.map(({ session_id, user_id, earliest_timestamp }) => (
                <SessionCard 
                key={session_id} 
                sessionId={session_id} // Pass the session count here
                userId={user_id}
                timestamp={earliest_timestamp}
                />
              ))}
            </div>
          ) : (
            <div className="sessions-list flex justify-center items-center">
              <CircularProgress style={{ color: '#FFA189' }}/>
            </div>
          )}
        </div>
    </div>
  );
};

export default Sessions;