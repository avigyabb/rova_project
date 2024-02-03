// TraceCard.js
import React from 'react';

const TraceCard = ({ name, metadata }) => {
  return (
    <div className="event-metadata">
      <h3>Metadata for {name}</h3>
      <pre>{JSON.stringify(metadata || {}, null, 2)}</pre>
    </div>
  );
};

export default TraceCard;
