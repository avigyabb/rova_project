import React, { useState } from 'react';
import { Button, Timeline} from 'flowbite-react';

const Sessions = () => {
  // Placeholder data - replace with your actual data fetching logic
  const userData = {
    name: 'Bo 31',
    group: 'Bo Company',
    updatedAt: '10 hours ago',
    sessions : [
      { time: '12:54:07 PM', name: 'Avi', group: 'Bo Company', key: 1 },
      { time: '12:52:01 PM', name: 'Sam', group: 'Harvest AI', key: 1 },
      { time: '12:24:07 PM', name: 'Karan', group: 'Swing Inc', key: 1 },
    ],
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-white shadow rounded-lg">

        { /* This is the middle column with events */ }
        <div className="md:w-2/3 p-4">
          <h3 className="text-lg font-semibold border-b pb-2">Sessions</h3>
          <div className="font-sans antialiased text-gray-900">
          <Timeline>
              {userData.sessions.map((e) => (
                // <div className={`event ${!event.product ? margin-left: '20px' : ''}`}>
                <Timeline.Item key={e.key} style={{ marginBottom: '5px'}}>
                  <button onClick={() => {}}>
                  <Timeline.Point />
                  <Timeline.Content>
                    <hr />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <Timeline.Time style={{ marginRight: '20px' }}>
                        {e.time}
                      </Timeline.Time>
                      <Timeline.Body>
                        {e.name}, {e.group}
                      </Timeline.Body>
                    </div>
                  </Timeline.Content>
                  </button>
                </Timeline.Item>
                // </div>
              ))}
            </Timeline>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;