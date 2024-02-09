import React, { useState, useRef,useEffect } from 'react';
import axios from 'axios';

const KeyMetricCard = () => {

  const [optionsArrayData, setOptionsArrayData] = useState([]);

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

    return (
      <div>
        <p className='text-4xl my-10 ml-10 mb-7'>Key Metrics</p>
      </div>
    );
  };
  
  export default KeyMetricCard;
  
