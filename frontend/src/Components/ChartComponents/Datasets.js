import React, { useState } from 'react';
import '../../styles/HomeComponents/Datasets.css'; // Make sure to create a corresponding CSS file for styling

// Sample database data
const databases = [
    {
      id: 1,
      type: 'CRM',
      name: 'Salesforce (suggested)',
      description: 'Send your contacts directly to Salesforce as either leads or contacts.',
      color: '#00A1E0',
      logo: '/logos/salesforce.png'
    },
    {
      id: 2,
      type: 'CRM',
      name: 'Hubspot (suggested)',
      description: 'Push your contacts to Hubspot and automate deal making.',
      color: '#FF7A59',
      logo: '/logos/hubspot.png'
    },
    {
      id: 3,
      type: 'Outbound Marketing',
      name: 'Outreach',
      description: 'Feed enriched prospects to Outreach and automate cold outreach.',
      color: '#5F6C7B',
      logo: '/logos/outreach.png'
    },
    {
      id: 4,
      type: 'CRM',
      name: 'Pipedrive',
      description: 'Fill up your Pipedrive with new opportunities and prospects from LinkedIn.',
      color: '#33333D',
      logo: '/logos/pipedrive.png'
    },
    {
      id: 5,
      type: 'CRM',
      name: 'Copper',
      description: 'Feed accurate email and phone data straight to your Copper account.',
      color: '#FF6633',
      logo: '/logos/copper.png',
      status: 'alpha'
    }
  ];

  // A function to generate a shade of light orange/sand color
const generateShadeOfSand = (index) => {
    const baseHue = 30; // Hue for orange/sand color
    const baseSaturation = 90; // High saturation for a rich color
    const lightnessStart = 85; // High lightness for a light shade
    const lightnessEnd = 65; // Lower lightness for a darker shade
    const range = lightnessStart - lightnessEnd;
    const lightness = lightnessStart - (index * (range / databases.length));
  
    return `hsl(${baseHue}, ${baseSaturation}%, ${lightness}%)`;
};
  
const DatasetCard = ({ database, index }) => {
    const [showOptions, setShowOptions] = useState(false);
  
    const handleOptionsClick = () => {
        console.log("Options clicked, current state is: ", !showOptions); // This should log the state change
        setShowOptions(!showOptions);
      };
  
    const cardStyle = {
      backgroundColor: generateShadeOfSand(index),
      height: '200px',
      width: '300px',
      position: 'relative', // Added to position children absolutely with respect to this card
    };
  
    return (
      <div className="database-card" style={cardStyle}>
        <div className="card-header">
          <img src={database.logo} alt={`${database.name} logo`} />
          <button className="options-button" onClick={handleOptionsClick}>⋮</button>
        </div>
        <div className="card-body">
          <h3>{database.name}</h3>
          <p>{database.description}</p>
        </div>
        {showOptions && (
          <div className={`card-options ${showOptions ? 'show' : ''}`}>
            <button>Export</button>
            <button>Edit</button>
          </div>
        )}
      </div>
    );
  };

const Databases = () => {
  return (
    <div className="mt-10 databases-page mr-10 ml-10" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'left' }}>
      {databases.map((database, index) => (
        <DatasetCard key={database.id} database={database} index={index}/>
      ))}
    </div>
  );
};

export default Databases;
