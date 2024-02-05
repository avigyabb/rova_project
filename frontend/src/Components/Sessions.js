import React, { useState, useEffect } from 'react';
import UserCard from "./SessionComponents/UserCard";
import axios from 'axios';
import SessionSearch from './SessionComponents/SessionSearch';
import CircularProgress from '@mui/material/CircularProgress';

const Sessions = () => {
  // Placeholder data - replace with your actual data fetching logic
  const [rsesh, setSesh] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {

    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:8000/get-sessions/');
        setSesh(response.data.sessions);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  // Effect to log `sesh` on updates CAN DELETE WHEN DONE - what is this?
  useEffect(() => {
    if (rsesh !== undefined) {
      console.log(rsesh);
    }
  }, [rsesh]);

  return (
    <div className="container mx-auto p-4">
      <SessionSearch setSesh={setSesh} setIsLoading={setIsLoading}/>
      { isLoading ? (
        <div className="min-h-80 flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      ) : (
        <div className='overflow-auto' style={{ height: 'calc(100vh - 180px)' }}>
          {rsesh}
          {/* {Object.entries(rsesh).map(([userId, userSessions]) => (
            <UserCard 
              key={userId} 
              user={{
                name: userId, // assuming userId is the name you want to display
                email: `${userId}@example.com`, // replace with real email
                updatedAt: 'Mar 31, 2020', // replace with real updated date
                country: 'Country', // replace with real country
                region: 'Region', // replace with real region
                // Add other user details here
              }}
              sessionCount={userSessions.length} // Pass the session count here
            />
          ))} */}
        </div>
      )}
    </div>
  );
};

export default Sessions;