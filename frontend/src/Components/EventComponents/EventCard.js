// EventCard.js
import React from 'react';

const EventCard = ({ event, onSelect, isSelected }) => {
  return (
    <div className={`event-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(event)}>
      <p>Type: {event.type}</p>
      <p>Event: {event.eventName}</p>
      <p>Time: {new Date(event.timestamp).toLocaleString()}</p>
    </div>
  );
};

export default EventCard;
