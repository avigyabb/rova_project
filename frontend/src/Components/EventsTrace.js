import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from  'axios';
import "../styles/EventTrace.css";

import EventCard from './EventComponents/EventCard';
import TraceCard from './EventComponents/TraceCard';

import { CircularProgress } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import GetAppIcon from '@mui/icons-material/GetApp';
import { Dropdown } from 'flowbite-react';


const EventsTrace = () => {
    const [userData, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const location = useLocation();
    const { userId, sessionId, index, sessionList } = location.state || {}; // Get the passed state
    const [sessionIdState, setSessionIdState] = useState(sessionId);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedTrace, setSelectedTrace] = useState(null);
    const [selectMode, setSelectMode] = useState(false);
    const [selectedTraces, setSelectedTraces] = useState([]);
    const [selectedValue, setSelectedValue] = useState("Neutral");

    console.log(sessionList);

    const handleChange = (event) => {
      // Update state with the new selected option's value
      setSelectedValue(event.target.value);
    };

    const navigate = useNavigate();

    console.log(sessionIdState)
    // fix this, create a better fix
    if (sessionId !== sessionIdState){
      setSessionIdState(sessionId);
    }

    function MyDropdown({options, id }) {

      // This function checks if the option is an array and returns the appropriate value
      const getOptionValue = (option) => {
        if (Array.isArray(option)) {
          return option[0];
        }
        return option; // If it's not an array, return the string directly
      };
    
      return (
        <select className="form-select ml-auto" value={selectedValue} onChange={handleChange} id={id}>
          {options.map((option, index) => (
            <option key={index} value={getOptionValue(option)}>
              {getOptionValue(option)}
            </option>
          ))}
        </select>
      );
    }

    useEffect(() => {
      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          var params = {
            session_id: sessionIdState,
          };
          const get_score = await axios.get(process.env.REACT_APP_API_URL + 'get-user-session-score/', { params });
          setSelectedValue(get_score.data.score);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [sessionIdState]);

    useEffect(() => {
      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          var params = {
            session_id: sessionIdState,
            score: selectedValue,
          };
          const send_score = await axios.post(process.env.REACT_APP_API_URL + 'post-user-session-score/', { params });
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [sessionIdState, selectedValue]);

    console.log(location.state)

    useEffect(() => {

      const fetchData = async () =>  {
        setIsLoading(true);
        try {
          if (sessionIdState >= 0) {
            const params = {
              sessionIds: JSON.stringify([sessionIdState]),
            };
            const response = await axios.get(process.env.REACT_APP_API_URL + "get-session-events-given-session-ids/", {params});
            setData(response.data.info);
          } else {
            const params = {
              userId: userId,
            };
            const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user/', { params });
            console.log(response.data.info)
            setData(response.data.info);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [sessionIdState]);

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    const seeAllUserEvents = () => {
      location.state.sessionId = -1;
      setSessionIdState(-1);
      setSelectedTraces([]);
    };

    if (!userId) return <div>No user data</div>;

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
      const headers = ["timestamp", "trace_id","event_name", "input_content", "output_content"]
      csvRows.push(headers.join(',')); // Create the header row
    
      // Add each object's values as a row
      for (const row of selectedTraces) {
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

    const handleClickNext = () => {
      setSelectedTrace(null);
      setSelectedEvent(null);
      navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${sessionList[index + 1].user_id}`, { state: { 
        userId: sessionList[index + 1].user_id, 
        sessionId: sessionList[index + 1].session_id, 
        index: index + 1, 
        sessionList 
      } });
    };

    const handleClickPrev = () => {
      setSelectedTrace(null);
      setSelectedEvent(null);
      navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${sessionList[index - 1].user_id}`, { state: { 
        userId: sessionList[index - 1].user_id, 
        sessionId: sessionList[index - 1].session_id, 
        index: index - 1, 
        sessionList 
      } });
    };

    const options = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive'];


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
                <p>User ID: {userId}</p>
                {/* <p>Email: {sessionData.email}</p> */}
              </div>
            </div>
          </div>
          <div className='flex' style={{borderBottom:'1px solid #e5e7eb', paddingBottom:"1%"}}>
            {sessionIdState >= 0 ? (
              <>
                <h1 className='ml-5 mb-1 text-xl' style={{marginRight: '5%'}}>
                  Session {sessionId} Events
                </h1>
                {index > 0 && <button className='nav-btn mr-4' onClick={handleClickPrev}> <ArrowLeftIcon/>Prev Session</button>}
                {index < sessionList.length - 1 && <button className='nav-btn' onClick={handleClickNext}> Next Session<ArrowRightIcon/></button>}
              </>
            ) : (
              <h1 className = 'ml-5 mb-1 text-xl'>
                Events Feed
              </h1>
            )}
            <MyDropdown options={options} id={"scoring_options"}> Score </MyDropdown>
            {!selectMode && (
              <>
              <button className='ml-5 mr-5' onClick={handleSelectBtn}> Select </button>
              <button className='mr-5'> Filter </button>
              </>
            )}
            {selectMode && (
              <>
              <button className='ml-5 mr-5' onClick={handleSelectBtn}> Cancel </button>
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
              <EventCard
                key={index}
                event={event}
                onSelect={handleEventSelect}
                isSelected={selectedEvent && selectedEvent === event}
                isSelectedInMode={selectedTraces.includes(event)}
                selectMode={selectMode}
              />
            ))}
            {sessionIdState >= 0 && <button class = "button_see_all_user_events text-sm ml-5" onClick={seeAllUserEvents}> See all of {userId}'s events </button>}
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

export default EventsTrace;