import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from  'axios';
import EventCard from './EventCard';
import "../styles/EventTrace.css"

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
    
    // Effect to log `sesh` on updates
    useEffect(() => {
      if (userData !== undefined) {
        console.log(userData);
      }
    }, [userData]);

    // Conditional rendering based on isLoading
    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!user) return <div>No user data</div>;

    return (
      <div className="event-list-container">
        <div className="event-list">
          <div className="user-info-card">
            <h3>User Info</h3>
            <p>User ID: {user.name}</p>
            <p>Email: {user.email}</p>
            {/* Render other user details */}
            <p>Sessions: {sessionCount}</p>
          </div>
          {userData.map((event, index) => (
            <EventCard
              key={index}
              event={event}
              onSelect={setSelectedEvent}
              isSelected={selectedEvent && selectedEvent.userId === event.userId && selectedEvent.timestamp === event.timestamp}
            />
          ))}
        </div>
        {selectedEvent && (
          <div className="event-metadata">
            <h3>Metadata for {selectedEvent.eventName}</h3>
            <pre>{JSON.stringify(selectedEvent.metadata || {}, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

export default EventsTrace;