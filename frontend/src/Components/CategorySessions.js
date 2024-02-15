import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from  'axios';
import "../styles/EventTrace.css";

import EventCard from './EventComponents/EventCard';
import TraceCard from './EventComponents/TraceCard';
import SessionCard from './SessionComponents/SessionCard';

import { CircularProgress } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import GetAppIcon from '@mui/icons-material/GetApp';


const CategorySessions = () => {

    const [userData, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();
    const { category_id } = location.state || {}; // Get the passed state
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedTraces, setSelectedTraces] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          const params = {
            category_id: category_id,
          };
          const response = await axios.get(process.env.REACT_APP_API_URL + 'categories/get-category-sessions/', { params });
          console.log(response.data.sessions)
          setData(response.data.sessions);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, []);

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    const handleSelectBtn= () => {
      setSelectMode(prevMode => !prevMode);
      if (selectMode) {
        setSelectedTraces([]);
      }
    }

    const handleEventSelect = (event) => {
      console.log(event)
      if (selectMode && event.table_source === "llm") {
        if (!selectedTraces.includes(event)) {
          setSelectedTraces(prevItems => [...prevItems, event]);
        } else {
          console.log("ran")
          console.log(selectedTraces.indexOf(event))
          setSelectedTraces(prevItems => prevItems.filter(item => item !== event));
        }
      } else if (!selectMode) {
        setSelectedEvent(event);
      }
    }

    function arrayToCSV() {
      // Assuming all objects have the same keys, use the keys from the first object for the header row
      const csvRows = [];
      // const headers = Object.keys(selectedTraces[0]);
      const headers = ["timestamp", "trace_id","event_name", "input_content", "output_content"]
      csvRows.push(headers.join(',')); // Create the header row
    
      // Add each object's values as a row
      for (const row of selectedTraces) {
        // const values = headers.map(header => {
        //   const escaped = ('' + row[header]).toString().replace(/"/g, '\\"'); // Escape double quotes
        //   return `"${escaped}"`; // Wrap values in double quotes
        // });
        // csvRows.push(values.join(','));

        for (const traceStep of row.events) {
          const values = headers.map(header => {
            const escaped = ('' + traceStep[header]).toString().replace(/"/g, '\\"'); // Escape double quotes
            return `"${escaped}"`; // Wrap values in double quotes
          });
          csvRows.push(values.join(','));
        }
      }
    
      const csvString = csvRows.join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'exported_traces.csv');
      document.body.appendChild(link); // Required for Firefox
      link.click();
      document.body.removeChild(link); // Clean up
    }

    return (
      <div className="event-list-container">
        <div className="left-column">
          <div className="user-info-card">
            <div className='flex flex-row'>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/1024px-Default_pfp.svg.png"
                alt="Profile"
                style={{
                  width: '100px', // Set the width (and height) to the desired value
                  height: '100px',
                  borderRadius: '50%', // This makes the image circular
                  objectFit: 'cover', // This ensures the image covers the area and is not stretched
                  border: '3px solid #e5e7eb',
                }}
              />
              <div className='flex flex-col mt-4 ml-4'>
                <p>User ID: </p>
                {/* <p>Email: {sessionData.email}</p> */}
              </div>
            </div>
          </div>
          <div className='flex' style={{borderBottom:'1px solid #e5e7eb', paddingBottom:"1%"}}>
            <h1 className = 'ml-5 mb-1 text-xl'>
                Events Feed
            </h1>
            {!selectMode && (
              <>
              <button className='ml-auto mr-5' onClick={handleSelectBtn}> Select </button>
              <button className='mr-5'> Filter </button>
              </>
            )}
            {selectMode && (
              <>
              <button className='ml-auto mr-5' onClick={handleSelectBtn}> Cancel </button>
              {selectedTraces.length > 0 && 
                <div className='export-btn flex items-center'>
                  <GetAppIcon className='mr-2'/>
                  <button onClick={arrayToCSV}> Export </button>
                </div>
              }
              </>
            )}
            
          </div>
          <div className="event-list">
            {userData.map((event, index) => (
              <SessionCard
                key={index}
                sessionId={event.session_id}
                userId={event.user_id}
                timestamp={event.timestamp}
                index={index}
                sessionList={[]}
              />
            ))}
          </div>
        </div>
        {selectedEvent && (
          <TraceCard 
            selectedEvent={selectedEvent} 
            selectedTrace={selectedTrace} 
            setSelectedEvent={setSelectedEvent} 
            setSelectedTrace={setSelectedTrace}
          />
        )}
      </div>
    );
  };

export default CategorySessions;