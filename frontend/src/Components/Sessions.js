import React, { useState, useEffect } from 'react';
import SessionCard from "./SessionComponents/SessionCard";
import axios from 'axios';
import '../styles/SessionSearch.css';
import '../styles/Sessions.css';

import SessionSearch from './SessionComponents/SessionSearch';
import SessionsAnalytics from './SessionsAnalytics';

import CircularProgress from '@mui/material/CircularProgress';
import { useLocation } from 'react-router-dom';
import GetAppIcon from '@mui/icons-material/GetApp';

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState('');
  const [sqlBox, setSqlBox] = useState(`SELECT *\nFROM (\nSELECT session_id FROM rova_dev.llm\nUNION DISTINCT\nSELECT session_id FROM rova_dev.product\n)\nLIMIT 50\n`);
  const location = useLocation();
  const { category_name } = location.state || {}; // Get the passed state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);

  const handleSqlChange = (event) => {
    // Update the sqlQuery state with the new value from the textarea
    setSqlBox(event.target.value);
  };
  
  const handleSqlQuery = (event) => {
    // Listen for command + enter key press
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      
      setIsLoading('Running SQL Query...');
  
      const fetchSqlResponse = async () => {
        try {
          const params = {
            sql: sqlBox
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions/', { params });
          setSessions(response.data.sessions);
          setIsLoading('');
        } catch (error) {
          console.error(error);
        }
      };
  
      fetchSqlResponse();
    }
  };

  const handleSelectBtn = () => {
    console.log("ran")
    if (selectMode) {
      setSelectedSessions([]);
    } else {
      setSelectedSessions(sessions);
    }
    setSelectMode(!selectMode);
  }

  const arrayToCSV = async () => {
    setIsLoading('Exporting Sessions to CSV...');
    setSelectMode(false);
    // Assuming all objects have the same keys, use the keys from the first object for the header row
    const csvRows = [];
    const headers = ["timestamp", "trace_id","event_name", "input_content", "output_content"]
    csvRows.push(headers.join(',')); // Create the header row
    
    // Add each object's values as a row
    for (const session of selectedSessions) {
      console.log(session);
      let response = null;
      try {
        const params = {
          sessionIds: JSON.stringify([session.session_id]),
        };
        response = await axios.get(process.env.REACT_APP_API_URL + 'get-session-events-given-session-ids/', { params });
      } catch (error) {
        console.error(error);
      }
      for (const event of response.data.info) {
        if (event.table_source === "llm") {
          for (const traceStep of event.events) {
            const values = headers.map(header => {
              const escaped = ('' + traceStep[header]).toString().replace(/"/g, '\\"'); // Escape double quotes
              return `"${escaped}"`; // Wrap values in double quotes
            });
            csvRows.push(values.join(','));
          }
        }
      }
    }
  
    const csvString = csvRows.join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported_traces.csv');
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
    setSelectedSessions([]);
    setIsLoading('');
  }

  const onSessionClickInMode = (clickedSession) => {
    const sessionExists = selectedSessions.some(session => session.session_id === clickedSession.session_id);
    if (sessionExists) {
      const newSessions = selectedSessions.filter(session => session.session_id !== clickedSession.session_id);
      setSelectedSessions(newSessions);
    } else {
      const newSessions = [...selectedSessions, clickedSession];
      setSelectedSessions(newSessions);
    }
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className='sessions-content flex'>
        <div className='left-col'>
          <SessionSearch setSessions={setSessions} setIsLoading={setIsLoading} setSqlBox={setSqlBox}/>
          <div class='explore-bar'>
            <h1 className='italic text-gray-500'> {Object.keys(sessions).length} results </h1>
            {!selectMode && (
              <>
              <button className='explore-btn ml-auto' onClick={handleSelectBtn}> Select </button>
              </>
            )}
            {selectMode && (
              <>
              <button className='ml-auto mr-5' onClick={handleSelectBtn}> Cancel </button>
              {selectedSessions.length > 0 && 
                <div className='export-btn flex items-center' onClick={arrayToCSV}>
                  <GetAppIcon className='mr-2'/>
                  <button> Export </button>
                </div>
              }
              </>
            )}
          </div>
          {(!isLoading && Object.keys(sessions).length > 0) && (
            <div className='sessions-results'>
              {sessions.map((session, index) => (
                <SessionCard 
                  key={session.session_id} 
                  sessionId={session.session_id} // Pass the session count here
                  userId={session.user_id}
                  timestamp={session.earliest_timestamp}
                  index={index}
                  sessionList={sessions}
                  categoryList={session.categories}
                  // dealing with export and select
                  onSessionClick={() => onSessionClickInMode(session)}
                  selectMode={selectMode}
                  selectedSessions={selectedSessions}
                />
              ))}
            </div>
          )}
          {isLoading && (
            <div className="flex flex-col justify-center items-center" style={{ height: '78%' }}>
              <p className="text-gray-500 mb-5"> {isLoading} </p>
              <CircularProgress style={{ color: '#FFA189' }}/>
            </div>
          )}
          {!isLoading && Object.keys(sessions).length == 0 && (
            <div className="flex justify-center items-center" style={{ height: '78%' }}>
              <p className='text-lg text-gray-500'> No Sessions Found 😶‍🌫️ </p>
            </div>
          )}
        </div>
        <div className='right-col'>
          <SessionsAnalytics 
            category_name={category_name}
            setSessions={setSessions}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            sqlBox={sqlBox}
            handleSqlChange={handleSqlChange}
            handleSqlQuery={handleSqlQuery}
          />
        </div>
      </div>
    </div>
  );
};

export default Sessions;