import React, { useState, useEffect } from 'react';
import axios from 'axios';

const KeyMetricCard = () => {
  const [optionsArrayData, setOptionsArrayData] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([{}]);

  useEffect(() => {
    const getOptions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}get-options/`);
        setOptionsArrayData(response.data.options);
      } catch (error) {
        console.error(error);
      }
    };
    getOptions();
  }, []);

    const handleEventChange = (index, value) => {
      const newSelectedEvents = [...selectedEvents];
      newSelectedEvents[index] = { value };
      setSelectedEvents(newSelectedEvents);
    };
  
    const handleAddEvent = () => {
      setSelectedEvents([...selectedEvents, { value: '' }]);
    };
  
    return (
      <p className='text-4xl my-10 ml-10 mb-7'>Key Metrics & Sequences</p>
    );
  };
  
  export default KeyMetricCard;
  
