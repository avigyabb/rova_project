import { useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SessionCard from "./SessionComponents/SessionCard";
function Paths() {
  const location = useLocation();

  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { start, end, step, numSteps, event } = location.state || {}; // Fallback to empty object if state is undefined

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const params = {
          start_event:start,
          end_event: end, 
          step_num: step, 
          num_steps: numSteps,
          event_name: event,
        };
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-sessions-at-step/', { params });
        setSessions(response.data.sessions);
        console.log(sessions);
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
    if (sessions !== undefined) {
      console.log(sessions);
    }
  }, [sessions]);

   // Conditional rendering based on isLoading
  if (isLoading) {
    return <div>Loading...</div>;
  }


  return <div>
         <div>Start: {start}, End: {end}, Step: {step}, Event: {event}, Sessions: </div>
         <div className = 'overflow-auto' style={{height: 'calc(100vh - 180px)'}}>
           {sessions.map(({session_id, user_id, earliest_timestamp}) => (
             <SessionCard
             key = {session_id}
             sessionId = {session_id}
             userId = {user_id}
             timestamp = {earliest_timestamp}
             />
           ))}
         </div>;
         </div>
};

export default Paths;

