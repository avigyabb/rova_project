import React, {useState, useEffect} from 'react';
import '../../styles/EventComponentsStyles/KeyMetricCard.css';
import axios from  'axios';
import CircularProgress from '@mui/material/CircularProgress';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Bar } from 'react-chartjs-2';
import '../../styles/Charts.css';

const KeyMetricCard = () => {

    const [keymetricList, setKeyMetricList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [newCategory, setNewCategory] = useState({ name: '', description: ''});
    const [showNewCategoryRow, setShowNewCategoryRow] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);

    // Fetches the category data
    const fetchData = async () =>  {
      setIsLoading(true);
        try {
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user-keymetrics/');
          setKeyMetricList(response.data.keymetrics);
          console.log(response.data.keymetrics)
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

    const handleAddNewKeyMetric = () => {
        setShowNewCategoryRow(!showNewCategoryRow);
    };

    const handleEdit = () => {
        setEditMode(!editMode);
    };

    const [optionsArrayData, setOptionsArrayData] = useState([]);
  
    useEffect(() => {
      const getOptions = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-options/`);
          response.data.options.push('churn')
          setOptionsArrayData(response.data.options);
        } catch (error) {
          console.error(error);
        }
      };
      getOptions();
    }, []);
  
    const handleSaveNewKeyMetric = async () => {
        console.log(selectedOptions)
        const newKeyMetric = {
            name: selectedOptions.join(', '),
            description: document.getElementById("newKeyMetricDescription").value,
            volume: '',
            importance: document.getElementById("newKeyMetricImportance").value,
            path: ''
        }
        // Save new category logic here
        // For example, you can send an API request to save the new category
        // After successful save, update category list and reset new category state
        setShowNewCategoryRow(false);
        try {
          console.log("NEW", newKeyMetric)
          const response = await axios.post(process.env.REACT_APP_API_URL + 'post-user-keymetric/', newKeyMetric);
          console.log(response);
        } catch (error) {
          console.error(error);
        } finally {
          fetchData();
        }
    };
  
    function Dropdown({ options, id }) {
      // This function checks if the option is an array and returns the appropriate value
      const getOptionValue = (option) => {
        if (Array.isArray(option)) {
          // Assuming the first element of the array is the value we want
          return option[0];
        }
        return option; // If it's not an array, return the string directly
      };
    
      return (
        <select className="form-select" id={id}>
          {options.map((option, index) => (
            <option key={index} value={getOptionValue(option)}>
              {getOptionValue(option)}
            </option>
          ))}
        </select>
      );
    }

    function MultiSelectDropdown({ options, id }) {
      // State to keep track of selected options and their order
    
      // This function checks if the option is an array and returns the appropriate value
      const getOptionValue = (option) => {
        if (Array.isArray(option)) {
          // Assuming the first element of the array is the value we want
          return option[0];
        }
        return option; // If it's not an array, return the string directly
      };
    
      // Function to handle option toggle
      const toggleOption = (optionValue) => {
        const currentIndex = selectedOptions.findIndex((opt) => opt === optionValue);
        let newSelectedOptions = [...selectedOptions];
    
        if (currentIndex === -1) {
          // Option not currently selected, add it to the state
          newSelectedOptions.push(optionValue);
        } else {
          // Option already selected, remove it from the state
          newSelectedOptions.splice(currentIndex, 1);
        }
    
        setSelectedOptions(newSelectedOptions);
      };
    
      return (
        <div>
          {options.map((option, index) => {
            const optionValue = getOptionValue(option);
            return (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`${id}_option_${index}`}
                  name="selectedOption"
                  value={optionValue}
                  checked={selectedOptions.includes(optionValue)}
                  onChange={() => toggleOption(optionValue)}
                  style={{ marginRight: '8px' }}
                />
                <label htmlFor={`${id}_option_${index}`}>{optionValue}</label>
              </div>
            );
          })}
          <div>Selected Options in Order:</div>
          <ul>
            {selectedOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
      );
    }
    

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    const keymetrics = keymetricList.map(keymetric => ({
        name: keymetric.name,
        description: keymetric.description,
        volume: keymetric.num_events, // Example volume
        importance: keymetric.importance, // Example trend
        path: "" // Example path
        })); 


      const removeKeyMetric = async (index) => {
        console.log({"index": index})
        const params = {
          index: index
        };
        try {
          const response = await axios.get(process.env.REACT_APP_API_URL + 'delete-user-keymetric/', { params });
        } catch (error) {
          console.error(error);
        } finally {
          setKeyMetricList(prevList => prevList.filter((_, idx) => idx !== keymetrics.length - index - 1));
        }
      }
      
      const TableRow = ({ keymetric, index }) => (
        <tr>
          <td><p className="inline-block categ-name">{keymetric.name}</p></td>
          <td>{keymetric.description}</td>
          <td>{keymetric.volume}</td>
          <td>{keymetric.importance}</td>
          <td style={{border: "none"}}>
            {editMode && <RemoveCircleIcon onClick={() => removeKeyMetric(index)}/>}
          </td>
        </tr>
      );

      const importanceArray = ["Very Negative", "Negative", "Neutral", "Positive", "Very Positive"];

      const NewTableRow = () => (
        <tr>
            <td>
              <MultiSelectDropdown options={optionsArrayData} id={"newKeyMetricName"}/>
            </td>
            <td style={{padding: "0"}}>
                <textarea
                    id="newKeyMetricDescription"
                    row="2"
                    cols="55"
                    type="text"
                    name="description"
                    placeholder="Enter description"
                />
            </td>
            <td>-</td>
            <td><Dropdown options={importanceArray} id={"newKeyMetricImportance"}/></td>
            <td style={{border: "none"}}>
              <button className="save-btn" style={{verticalAlign: "middle"}} onClick={handleSaveNewKeyMetric}>Save</button>
            </td>
            <td style={{border: "none"}}>
              <button style={{verticalAlign: "middle"}} onClick={handleAddNewKeyMetric}>Cancel</button>
            </td>
        </tr>
    );    
      
      const TopicTable = () => {
        return (
          <table style={{ width: '1100px' }}>
            <thead>
              <tr>
                <th className="w-60">Event</th>
                <th className="w-96">Description</th>
                <th className="w-30">Volume</th>
                <th className='w-48'>Interaction Quality</th>
              </tr>
            </thead>
            <tbody>
            {showNewCategoryRow && <NewTableRow/>}
              {keymetrics.slice().reverse().map((keymetric, index) => (
                <TableRow key={index} keymetric={keymetric} index={index}/>
              ))}
            </tbody>
          </table>
        );
      };

          // Prepare data for chart
      const chartData = {
        labels: keymetrics.map(metric => metric.name),
        datasets: [
          {
            label: 'Volume',
            data: keymetrics.map(metric => metric.volume),
            backgroundColor: 'rgba(255, 161, 137, 1.0)',
          },
        ],
      };

    const chartOptions = {
      plugins: {
        title: {
          display: true,
          text: 'Volume by Event',
        },
      },
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          display: false
        }
      },
      maintainAspectRatio: false, // Adjust aspect ratio here
      aspectRatio: 2, // Lower values will make the chart taller, and higher values will make it wider
    };
    const FlipCard = ({ name, analysis }) => {
      const [isFlipped, setIsFlipped] = useState(false);
    
      const flipCard = () => {
        setIsFlipped(!isFlipped);
      };
    
      return (
        <div className="m-2">
          <div
            className={`w-48 h-48 transition-transform duration-500 ease-linear
                        transform perspective-1000 ${isFlipped ? 'rotate-y-180' : ''}
                        shadow-lg cursor-pointer rounded-lg overflow-hidden relative`}
            onClick={flipCard}
          >
            <div className={`absolute inset-0 flex items-center justify-center p-2 ${isFlipped ? 'bg-orange-100' : 'bg-orange-200'}`}>
              {isFlipped ? (
                <div className="text-center text-white-900 overflow-auto text-xs h-full">{analysis}</div>
              ) : (
                <div className="text-center text-xs text-white-700">{name}</div>
              )}
            </div>
          </div>
        </div>
      );
    };
     
    
    const Categories = ({ categories }) => {
      // Skip the first element using slice
      const itemsToDisplay = categories;
    
      return (
        <div className="flex flex-wrap justify-center">
          {itemsToDisplay.map((category, index) => (
            <FlipCard key={index} name={category.name} analysis={category.analysis} />
          ))}
        </div>
      );
    };

      return (
        <div className='charts-content'>
          <div className='flex'>
            <p className='text-4xl mb-7'>Key Performance Indicators</p>
            {!showNewCategoryRow && !editMode ? (
              <>
                <button className='ml-auto mb-5' onClick={handleEdit}> Edit </button>
                <button className='add-btn ml-10 mb-5 w-32' onClick={handleAddNewKeyMetric}> Add New </button>
              </>
            ) : editMode ? (
              <button className='ml-auto' onClick={handleEdit}> Done </button>
            ) : null}
          </div>
          <TopicTable />
          <div className='flex mt-10'>
          <div className='chart-container' style={{ width: '50%', height: '400px', marginTop: '10px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
          <div className='flex-1'>
            <Categories categories={keymetricList} />
          </div>
          </div>
        </div>
      );
  };
  
  export default KeyMetricCard;