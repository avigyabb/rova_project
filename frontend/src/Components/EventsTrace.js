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

    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTrace, setSelectedTrace] = useState(null);

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
            <button className='ml-auto mr-5'> Select </button>
            <button className='mr-5'> Filter </button>
            <button> Export </button>
          </div>
          <div className="event-list">
            {userData.map((event, index) => (
              <EventCard
                key={index}
                event={event}
                onSelect={setSelectedEvent}
                isSelected={selectedEvent && selectedEvent === event}
              />
            ))}
            {sessionIdState >= 0 && <button class = "button_see_all_user_events" onClick={seeAllUserEvents}> See all of user {userId}'s events </button>}
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