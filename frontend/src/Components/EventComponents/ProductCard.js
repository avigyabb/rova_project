import React from 'react';
// Define the EventCard component
const ProductCard = ({ styles, eventData }) => {
    // Destructure the eventData prop to get the necessary fields
    const { event_name, timestamp, user_id } = eventData;
  
    // Convert timestamp to a more readable format
    const formattedTimestamp = new Date(timestamp).toLocaleString();
  
    return (
      <div style={styles.card}>
        {/* <h2 style={styles.title}>Event Summary</h2> */}
        <div style={styles.info}>
          <strong>Event Name:</strong> {event_name}
        </div>
        <div style={styles.info}>
          <strong>Timestamp:</strong> {formattedTimestamp}
        </div>
        <div style={styles.info}>
          <strong>User ID:</strong> {user_id}
        </div>
      </div>
    );
  };

  export default ProductCard;
  
  