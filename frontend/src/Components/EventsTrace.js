import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from  'axios';
import "../styles/EventTrace.css";

import EventCard from './EventComponents/EventCard';
import TraceCard from './EventComponents/TraceCard';

import { CircularProgress } from '@mui/material';


const EventsTrace = () => {

    const [userData, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const { userId, sessionId } = location.state || {}; // Get the passed state
    const [sessionIdState, setSessionIdState] = useState(sessionId);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedTraces, setSelectedTraces] = useState([]);

    useEffect(() => {

      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          const params = {
            userId: userId,
            sessionId: sessionIdState,
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user/', { params });
          setData(response.data.info);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [sessionIdState]);

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    const seeAllUserEvents = () => {
      setSessionIdState(-1);
    };

    if (!userId) return <div>No user data</div>;

    const handleSelectBtn= () => {
      setSelectMode(prevMode => !prevMode);
      if (selectMode) {
        setSelectedTraces([]);
      }
    }

    const handleEventSelect = (event) => {
      if (selectMode) {
        if (!selectedTraces.includes(event)) {
          setSelectedTraces(prevItems => [...prevItems, event]);
        } else {
          console.log("ran")
          console.log(selectedTraces.indexOf(event))
          setSelectedTraces(prevItems => prevItems.filter(item => item !== event));
        }
      } else {
        setSelectedEvent(event);
      }
    }

    function arrayToCSV() {
      console.log("hello")
      // Assuming all objects have the same keys, use the keys from the first object for the header row
      const csvRows = [];
      const headers = Object.keys(selectedTraces[0]);
      csvRows.push(headers.join(',')); // Create the header row
    
      // Add each object's values as a row
      for (const row of selectedTraces) {
        const values = headers.map(header => {
          const escaped = ('' + row[header]).toString().replace(/"/g, '\\"'); // Escape double quotes
          return `"${escaped}"`; // Wrap values in double quotes
        });
        csvRows.push(values.join(','));
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
    }

    console.log(selectMode);
    console.log(selectedTraces);


    return (
      <div className="event-list-container">
        <div className="left-column">
          <div className="user-info-card">
            <div className='flex flex-row'>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png"
                alt="Profile"
                style={{
                  width: '100px', // Set the width (and height) to the desired value
                  height: '100px',
                  borderRadius: '50%', // This makes the image circular
                  objectFit: 'cover', // This ensures the image covers the area and is not stretched
                  border: '3px solid #e5e7eb',
                }}
              />
              <div className='flex flex-col mt-4 ml-4'>
                <p>User ID: {userId}</p>
                {/* <p>Email: {sessionData.email}</p> */}
              </div>
            </div>
            {/* need to get rid of this */}
            <p className='mt-2'>Session ID: {sessionId}</p>
          </div>
          <div className='flex' style={{borderBottom:'1px solid #e5e7eb', paddingBottom:"1%"}}>
            {sessionIdState >= 0 ? (
              <h1 className='ml-5 mb-1 text-xl'>
                Session {sessionId} Events
              </h1>
            ) : (
              <h1 className = 'ml-5 mb-1 text-xl'>
                Events Feed
              </h1>
            )}
            {!selectMode && (
              <>
              <button className='ml-auto mr-5' onClick={handleSelectBtn}> Select </button>
              <button className='mr-5'> Filter </button>
              </>
            )}
            {selectMode && (
              <>
              <button className='ml-auto mr-5' onClick={handleSelectBtn}> Cancel </button>
              <button onClick={arrayToCSV}> Export </button>
              </>
            )}
            
          </div>
          <div className="event-list">
            {userData.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onSelect={handleEventSelect}
                isSelected={selectedEvent && selectedEvent === event}
                isSelectedInMode={selectedTraces.includes(event)}
              />
            ))}
            {sessionIdState >= 0 && <button class = "button_see_all_user_events text-sm ml-5" onClick={seeAllUserEvents}> See all of {userId}'s events </button>}
          </div>
        </div>
        {selectedEvent && (
          <TraceCard 
            selectedEvent={selectedEvent} 
            selectedTrace={selectedTrace} 
            setSelectedEvent={setSelectedEvent} 
            setSelectedTrace={setSelectedTrace}
          />
        )}
      </div>
    );
  };

export default EventsTrace;