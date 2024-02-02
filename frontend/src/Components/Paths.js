import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
function Paths() {
  const location = useLocation();

  const [filteredPaths, setFilteredPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { start, end, step, type } = location.state || {}; // Fallback to empty object if state is undefined

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const params = {
          startEvent:start,
          endEvent: end, 
          step_num: step, 
          type: type,
        };
        const response = await axios.get('http://localhost:8000/get-fpaths/', { params });
        setFilteredPaths(response.data.info);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Effect to log `sesh` on updates CAN DELETE WHEN DONE
  useEffect(() => {
    if (filteredPaths !== undefined) {
      console.log(filteredPaths);
    }
  }, [filteredPaths]);

   // Conditional rendering based on isLoading
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return <div>Start: {start}, End: {end}, Step#: {step}, Type: {type}</div>;
};

export default Paths;

