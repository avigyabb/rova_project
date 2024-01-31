import React, { useState } from 'react';
import { Button, Timeline} from 'flowbite-react';
import { FaAngleRight, FaAngleLeft} from 'react-icons/fa';

const EventsTrace = () => {
  // Placeholder data - replace with your actual data fetching logic
  const userData = {
    name: 'Bo 31',
    group: 'Bo Company',
    updatedAt: '10 hours ago',
    events : [
      { time: '12:54:07 PM', product: true, type: 'Button Click', metadata: '1', key: 1 },
      { time: '12:54:07 PM', product: true, type: 'Chat Message', metadata: '2', key: 2 },
      { time: '12:53:50 PM', product: false, type: 'Retrieval', metadata: '3', key: 3 },
      { time: '12:53:50 PM', product: false, type: 'Output', metadata: '4', key: 4 },
      { time: '12:52:06 PM', product: true, type: 'Button Click', metadata: '5', count: 4, key: 5 },
    ],
  };

  const [highlightedKey, setHighlightedKey] = useState(1);
  const handleKeyChange = (key) => {
    setHighlightedKey(key);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row bg-white shadow rounded-lg">

        { /* This is the left column with user info */ }
        <div className="md:w-1/5 p-4 border-b md:border-b-0 md:border-r">
          <div className="flex items-center">
            <div className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
              {/* Replace with actual image path */}
              <img src="path_to_profile_image" alt="Profile" />
            </div>
            <div className="ml-4">
              <p className="text-lg font-semibold">{userData.name}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-600">Group: {userData.group}</p>
            <p className="text-sm text-gray-600">Updated at: {userData.updatedAt}</p>
            <Button color="red" onClick={() => { /* handle delete action */ }}>
              Delete User Profile
            </Button>
          </div>
        </div>

        { /* This is the middle column with events */ }
        <div className="md:w-2/5 p-4">
          <h3 className="text-lg font-semibold border-b pb-2">User Events</h3>
          <div className="font-sans antialiased text-gray-900">
          <Timeline>
              {userData.events.map((e) => (
                // <div className={`event ${!event.product ? margin-left: '20px' : ''}`}>
                <Timeline.Item key={e.key} style={{ marginBottom: '5px', fontSize: !e.product ? '10.5pt' : '12pt', marginLeft: !e.product ? '30px' : '' }}>
                  <Timeline.Point />
                  <Timeline.Content>
                    <hr />
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                      <Timeline.Time style={{ marginRight: '10px', fontSize: !e.product ? '10.5pt' : '12pt' }}>
                        {e.time}
                      </Timeline.Time>
                      <Timeline.Body>
                        {e.type} {e.count ? ` ${e.count}` : ''}
                      </Timeline.Body>
                      <button style={{ marginLeft: 'auto' }} onClick={() => handleKeyChange(e.key)}>{e.key === highlightedKey ? <FaAngleLeft /> : <FaAngleRight />}</button>
                    </div>
                  </Timeline.Content>
                </Timeline.Item>
                // </div>
              ))}
            </Timeline>
          </div>
        </div>

        { /* This is the right column with metadata */ }
        <div className="md:w-2/5 p-4 border-b md:border-b-0 md:border-r">
          <h3 className="text-lg font-semibold pb-2">{userData.events[highlightedKey - 1].type}</h3>
          Metadata: {userData.events[highlightedKey - 1].metadata}
        </div>
      </div>
    </div>
  );
};

export default EventsTrace;