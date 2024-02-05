// EventCard.js
import React from 'react';
import "../../styles/EventCard.css";
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import DashboardIcon from '@mui/icons-material/Dashboard';

const EventCard = ({ event, onSelect, isSelected }) => {
  return (
    <div className={`event-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(event)}>
      <div className='flex'>
        {event.table_source === "llm" && (
          < ViewTimelineIcon />
        )}
        {event.table_source === "product" && (
          < DashboardIcon />
        )}
        <p className='ml-6'>{event.event_name}</p>
      </div>
      <div className='time-container'>
        <p>{new Date(event.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default EventCard;
