// EventCard.js
import React from 'react';
import "../../styles/EventCard.css";
import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const EventCard = ({ event, onSelect, isSelected, isSelectedInMode, selectMode }) => {
  return (
    <div className={`event-card ${isSelectedInMode ? 'selectedInMode' : isSelected && !selectMode ? 'selected' : ''}`} onClick={() => onSelect(event)}>
      <div className='flex items-center'>
        {event.error_ocurred && event.table_source === "llm" ? (
          < ErrorIcon fontSize='small' style={{color: '#B02300'}}/>
        ) : (
          < CheckCircleIcon fontSize='small' style={{color: 'green'}}/>
        )}
        {event.table_source === "llm" && (
          < ViewTimelineIcon className='ml-12'/>
        )}
        {event.table_source === "product" && (
          < DashboardIcon className='ml-12'/>
        )}
        <p className='ml-3'>{event.event_name}</p>
      </div>
      <div className='time-container'>
        <p>{new Date(event.timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default EventCard;
