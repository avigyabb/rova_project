import React, { useState } from 'react';
import '../../styles/HomeComponents/Datasets.css'; // Make sure to create a corresponding CSS file for styling
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { Icon } from '@mui/material';
import GetAppIcon from '@mui/icons-material/GetApp';

// Initial sample database data
const initialDatasets = [
  {
    id: 1,
    type: 'CRM',
    name: 'Salesforce (suggested)',
    description: 'Send your contacts directly to Salesforce as either leads or contacts.',
    color: '#00A1E0',
    logo: '/logos/salesforce.png',
    count: '1,000,000',
    score: '50',
    tags: [
      'CRM',
      'Salesforce',
      'Lead',
    ]
  }
];

function getScoreColorHSL(score) {
    if (score < 0) {
        return '#A3A3A3';
    }
    const cappedScore = Math.max(0, Math.min(score, 100));
    const hue = (cappedScore / 100) * 120;
    const lightness = 40;
    return `hsl(${hue}, 100%, ${lightness}%)`;
}

  
const DatasetCard = ({ dataset, index, onDelete}) => {
    const [showOptions, setShowOptions] = useState(false);
    const scoreColor = getScoreColorHSL(dataset.score);
    const [cardColor, setCardColor] = useState('white');
    
    const handleOptionsClick = () => {
      console.log("Options clicked, current state is: ", !showOptions); // This should log the state change
      setShowOptions(!showOptions);
    };
  
    const handleDelete = () => {
      onDelete(dataset.id); // Call the passed deletion function with the id
    };

    const handleDatasetClick = () => {
      setCardColor(cardColor === 'white' ? 'lightgray' : 'white');
    }

    const cardStyle = {
      height: '200px',
      width: '350px',
      position: 'relative',
      backgroundColor: cardColor,
    };
  
    return (
      <div className="database-card" style={cardStyle} onClick={handleDatasetClick}>
        <div className="text-lg font-bold flex p-3">
          {dataset.name}
          <div className='ml-auto score' style={{ color: scoreColor }}>
            <p>{dataset.score >= 0 ? dataset.score : '-'}</p>
          </div>
        </div>
        <div className="card-body">
          <div className='text-sm'>{dataset.description}</div>
          <hr class="faint-line" />
          <div className='flex flex-row'>
            <div>
                <div className='text-xs count'>Items</div>
                <div className='text-xs count'>{dataset.count}</div>
            </div>
            <div className='ml-auto'>
                <div className='text-xs count'>
                    {dataset.tags.map((tag, index) => (
                        <div key={index} className="tag">{tag}</div>
                    ))}
                </div>
            </div>
            <IconButton onClick={handleDelete} aria-label='delete' size='small'>
                <DeleteIcon fontSize='small' />
            </IconButton>          
          </div>
        </div>
        {showOptions && (
          <div className={`card-options ${showOptions ? 'show' : ''}`}>
            <button>Export</button>
            <button>Edit</button>
          </div>
        )}
        {cardColor === 'lightgray' && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center">
              <div className='export-btn flex items-center'>
                <GetAppIcon className='mr-2'/>
                <button> Export </button>
              </div>
          </div>
        )}
      </div>
    );
  };

const Databases = () => {
  const [datasets, setDatasets] = useState(initialDatasets);

  const addNewDataset = () => {
    const newDataset = {
      id: Math.max(...datasets.map(d => d.id)) + 1, // Improved id assignment
      type: 'New Type',
      name: `New Dataset ${datasets.length + 1}`,
      description: 'This is a new dataset.',
      color: '#FFD700',
      logo: '/logos/newlogo.png',
      count: '0',
      score: '0',
      tags: ['New', 'Dataset']
    };
    setDatasets([...datasets, newDataset]);
  };
  
  const deleteDataset = (id) => {
    setDatasets(datasets.filter(dataset => dataset.id !== id));
  };

  return (
    <div className="mt-10 databases-page mr-10 ml-10" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {datasets.map((dataset, index) => (
        <DatasetCard key={dataset.id} dataset={dataset} onDelete={deleteDataset} index={index}/>
      ))}
      <IconButton onClick={addNewDataset} className="ml-auto" aria-label="add-new-dataset" size="small">
        <AddIcon fontSize="small" />
      </IconButton>
    </div>
  );
};

export default Databases;
