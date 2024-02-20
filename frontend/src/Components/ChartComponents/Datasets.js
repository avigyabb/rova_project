import React, { useState, useEffect} from 'react';
import axios from  'axios';
import '../../styles/HomeComponents/Datasets.css'; // Make sure to create a corresponding CSS file for styling
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import GetAppIcon from '@mui/icons-material/GetApp';
import CircularProgress from '@mui/material/CircularProgress';


// Initial sample database data
const initialDatasets = [
  {
    name: 'Salesforce (suggested)',
    description: 'Send your contacts directly to Salesforce as either leads or contacts.',
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

const cardStyle = {
  height: '200px',
  width: '350px',
  position: 'relative',
  backgroundColor: 'white',
};

const EditableDatasetCard = ({onSave}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    const newDataset = {
      name: name,
      description: description
    }
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + 'data_sets/add-new-dataset/', newDataset);
      console.log(response);
    } catch (error) {
      console.error(error);
    } finally {
      // fetchData();
      // setAddCategoryLoading(false);
    }
    onSave();
  };

  return (
    <div className="database-card" style={cardStyle}>
      <div className="text-lg font-bold flex p-3">
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="dataset-input" // Assign proper CSS classes as needed
      />
      </div>
      <div className="card-body">
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="dataset-textarea" // Assign proper CSS classes as needed
      />
        <hr class="faint-line" />
        <IconButton onClick={handleSave} aria-label="done" size="small">
        <CheckIcon fontSize="small" />
      </IconButton>        
        </div>
      </div>
  );
};
  
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
    const [isAdding, setIsAdding] = useState(false); // New state to manage if adding new dataset
    const [isLoading, setIsLoading] = useState(false);

    // Fetches the datasets
    const fetchData = async () =>  {
      setIsLoading(true);
        try {
          // const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user-categories/');
          const datasets_response = await axios.get(process.env.REACT_APP_API_URL + 'data_sets/get-properties-for-datasets/');
          console.log(datasets_response.data.datasets);
          setDatasets(datasets_response.data.datasets);
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      };

    // Fetch data on page open
    useEffect(() => {
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
  
    const handleAddNewDataset = () => {
      setIsAdding(true); // Activates the editing mode for a new dataset
    };
  
    const saveNewDataset = (newDataset) => {
      setIsAdding(false); // Deactivates the editing mode
      fetchData();
    };
  
    const deleteDataset = (id) => {
      setDatasets(datasets.filter(dataset => dataset.id !== id));
    };
  
    return (
      <div className="mt-10 databases-page mr-10 ml-10" style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {datasets.map((dataset, index) => (
          <DatasetCard key={dataset.id} dataset={dataset} onDelete={deleteDataset} index={index}/>
        ))}
        {isAdding && (
        <EditableDatasetCard onSave={saveNewDataset} />
      )}
        <IconButton onClick={handleAddNewDataset} className="ml-auto" aria-label="add-new-dataset" size="small">
          <AddIcon fontSize="small" />
        </IconButton>
      </div>
    );
  };
  
  export default Databases;