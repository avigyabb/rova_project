import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/EventComponentsStyles/Sequences.css';

const Sequences = () => {
  const [optionsArrayData, setOptionsArrayData] = useState([]);
  const [events, setEvents] = useState([{ value: '' }]);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-options/`);
        setOptionsArrayData(response.data.options);
      } catch (error) {
        console.error(error);
      }
    };
    getOptions();
  }, []);

  // Function to handle adding a new event
  const addEvent = () => {
    setEvents([...events, { value: '' }]);
  };

  // Function to handle changing an event
  const handleEventChange = (index, newValue) => {
    const newEvents = [...events];
    newEvents[index].value = newValue;
    setEvents(newEvents);
  };

  // Function to handle deleting an event
  const deleteEvent = (index) => {
    const newEvents = events.filter((_, eventIndex) => eventIndex !== index);
    setEvents(newEvents);
  };

  return (
    <div className='ml-10'>
      <p className='text-4xl my-10 ml-10 mb-7'>Sequences</p>
      {events.map((event, index) => (
      <div key={index} className="event-container">
        <div className="dropdown-container">
          <select
            value={event.value}
            onChange={(e) => handleEventChange(index, e.target.value)}
            className="select rounded-dropdown"
          >
            <option value="">Select an Event</option>
            {optionsArrayData.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
          {index !== 0 && (
            <svg onClick={() => deleteEvent(index)} className="delete-icon" viewBox="0 0 24 24">
              <path d="M3 6v18h18V6H3zm5 2h2v12H8V8zm4 0h2v12h-2V8zm4 0h2v12h-2V8zM5 4h14l-1-1h-12l-1 1z"/>
            </svg>
          )}
        </div>
        {index < events.length - 1 && (
          <div className="arrow-container">
            <span className="arrow">↓</span>
          </div>
        )}
      </div>
      ))}
      <button onClick={addEvent} className="add-btn w-64">Add Event</button>
    </div>
  );
};

export default Sequences;
