import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from  'axios';
import EventCard from './EventComponents/EventCard';
import "../styles/EventTrace.css"
import BorderClearIcon from '@mui/icons-material/BorderClear';
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import { CircularProgress } from '@mui/material';

//  HERE user.name is really the userId of the user 

const EventsTrace = () => {

    const [userData, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const { user, sessionCount } = location.state || {}; // Get the passed state

    useEffect(() => {

      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          const params = {
            userId:user.name,
          };
          const response = await axios.get('http://localhost:8000/get-user/', { params });
          setData(response.data.info);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []);

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTrace, setSelectedTrace] = useState(null);
    
    // Effect to log `sesh` on updates
    useEffect(() => {
      if (userData !== undefined) {
        console.log(userData);
      }
    }, [userData]);

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    if (!user) return <div>No user data</div>;

    return (
      <div className="event-list-container">
        <div className="left-column">
          <div className="user-info-card">
            <div className='flex flex-row'>
              <img
                src="https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png"
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
                <p>User ID: {user.name}</p>
                <p>Email: {user.email}</p>
              </div>
            </div>
            {/* Render other user details */}
            <p className='mt-2'>Sessions: {sessionCount}</p>
          </div>
          <h1 className='ml-5 mb-1 text-xl' style={{borderBottom:'1px solid #e5e7eb', paddingBottom:"1%"}}>Events Feed</h1>
          <div className="event-list">
            {userData.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onSelect={setSelectedEvent}
                isSelected={selectedEvent && selectedEvent === event}
              />
            ))}
          </div>
        </div>
        {selectedEvent && (
          <div className="right-column">
            <div className='event-metadata-navbar flex items-center'>
              <KeyboardDoubleArrowRightIcon className="back-icon mr-2" fontSize="large" onClick={() => setSelectedEvent(null)}/>
              <h1 className='text-xl'> Execution of {JSON.stringify(selectedEvent.type)} </h1>
            </div>
              {selectedEvent.type == "Trace" && (
                <div className="event-metadata-content">
                  {/* <pre>{JSON.stringify(selectedEvent || {}, null, 2)}</pre> */}
                  <div className="sidebar flex flex-col">
                    <div className="traceBox mb-1 flex" onClick={() => setSelectedTrace(null)}>
                      <ViewTimelineIcon className="mr-2"/>
                      Trace
                    </div>
                    {selectedEvent.events.map((trace, index) => (
                      <div className="traceBox flex flex-row" onClick={() => setSelectedTrace(trace)}> 
                        <BorderClearIcon className="ml-2 mr-2"/>
                        {JSON.stringify(trace.eventName)} 
                      </div>
                    ))}
                  </div>
                  <div className="trace-content">
                    {selectedTrace ? (
                      <div>
                        <p> System Prompt </p>
                        {JSON.stringify(selectedTrace.systemPrompt)}
                      </div>
                    ) : (
                      <div>
                        <h1 className='text-xl'> Trace Info </h1>
                        Time: {new Date(selectedEvent.timestamp).toLocaleString()}
                      </div>
                    )
                    }
                  </div>
                </div>
              )}
              {selectedEvent.type == "Product" && (
                <div className="event-metadata-content">
                  <pre> {JSON.stringify(selectedEvent || {}, null, 2)} </pre>
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

export default EventsTrace;