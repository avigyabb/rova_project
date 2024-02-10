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
          console.log(response);
          setKeyMetricList(response.data.keymetrics);
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

      const importanceArray = ["Low", "Medium", "High"];

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
                <th className='w-48'>Importance</th>
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
        labels: keymetrics.slice(1).map(metric => metric.name),
        datasets: [
          {
            label: 'Volume',
            data: keymetrics.slice(1).map(metric => metric.volume),
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
        }
      },
      maintainAspectRatio: false, // Adjust aspect ratio here
      aspectRatio: 2, // Lower values will make the chart taller, and higher values will make it wider
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
          <div className='chart-container' style={{ width: '50%', height: '400px', marginTop: '10px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      );
  };
  
  export default KeyMetricCard;