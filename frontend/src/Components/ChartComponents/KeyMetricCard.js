import React, {useState, useEffect} from 'react';
import '../../styles/EventComponentsStyles/KeyMetricCard.css';
import axios from  'axios';
import CircularProgress from '@mui/material/CircularProgress';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import '../../styles/Charts.css';

const KeyMetricCard = () => {

    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [newCategory, setNewCategory] = useState({ name: '', description: ''});
    const [showNewCategoryRow, setShowNewCategoryRow] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Fetches the category data
    const fetchData = async () =>  {
      setIsLoading(true);
        try {
          const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user-categories/');
          console.log(response);
          setCategoryList(response.data.categories);
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

    const handleAddNewCategory = () => {
        setShowNewCategoryRow(!showNewCategoryRow);
    };

    const handleEdit = () => {
        setEditMode(!editMode);
    };

    const [optionsArrayData, setOptionsArrayData] = useState([]);
    const [events, setEvents] = useState([{ value: '' }]);
  
    useEffect(() => {
      const getOptions = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-options/`);
          setOptionsArrayData(response.data.options);
          console.log(response.data.options);
        } catch (error) {
          console.error(error);
        }
      };
      getOptions();
    }, []);
  
    const handleSaveNewCategory = async () => {
        // Save new category logic here
        // For example, you can send an API request to save the new category
        // After successful save, update category list and reset new category state
        setShowNewCategoryRow(false);
        const newCategory = {
            name: document.getElementById("newCategoryName").value,
            description: document.getElementById("newCategoryDescription").value,
            volume: '',
            trend: '',
            path: ''
        }
        try {
          const response = await axios.post(process.env.REACT_APP_API_URL + 'post-user-category/', newCategory);
          console.log(response);
        } catch (error) {
          console.error(error);
        } finally {
          fetchData();
        }
    };
    function Dropdown({ options }) {
      // This function checks if the option is an array and returns the appropriate value
      const getOptionValue = (option) => {
        if (Array.isArray(option)) {
          // Assuming the first element of the array is the value we want
          return option[0];
        }
        return option; // If it's not an array, return the string directly
      };
    
      return (
        <select className="form-select">
          {options.map((option, index) => (
            <option key={index} value={getOptionValue(option)}>
              {getOptionValue(option)}
            </option>
          ))}
        </select>
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

    const categories = categoryList.map(category => ({
        name: category.name,
        description: category.description,
        volume: category.num_events, // Example volume
        trend: '', // Example trend
        path: "" // Example path
        })); 
    
      const TrendLine = ({ value, trend, path }) => {
        // Choose the path based on the trend
        // const pathData = trend === 'up' ? trendPath.up : trendPath.down;
      
        // Set the color based on whether the value is positive or negative
        const color = value.startsWith('-') ? 'red' : 'green';
      
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="mr-3" style={{ color: color }}>{value}</span>
            <svg width="120" height="40" viewBox="0 0 120 40" >
              <path d={path} fill="none" stroke={color} strokeWidth="2" />
            </svg>
          </div>
        );
      };

      const removeCategory = async (index) => {
        console.log({"index": index})
        const params = {
          index: index
        };
        try {
          const response = await axios.get(process.env.REACT_APP_API_URL + 'delete-user-category/', { params });
        } catch (error) {
          console.error(error);
        } finally {
          setCategoryList(prevCategories => prevCategories.filter((_, idx) => idx !== categories.length - index - 1));
        }
      }
      
      const TableRow = ({ category, index }) => (
        <tr>
          <td><p className="inline-block categ-name">{category.name}</p></td>
          <td>{category.description}</td>
          <td>{category.volume}</td>
          <td>
            {/* This would be replaced with a chart component */}
            <div className="trend-line">
              <TrendLine value={category.trend} trend='up' path={category.path}/>
            </div>
          </td>
          <td style={{border: "none"}}>
            {editMode && <RemoveCircleIcon onClick={() => removeCategory(index)}/>}
          </td>
        </tr>
      );

      const NewTableRow = () => (
        <tr>
            <td>
              <Dropdown options={optionsArrayData}/>
            </td>
            <td style={{padding: "0"}}>
                <textarea
                    id="newCategoryDescription"
                    row="2"
                    cols="55"
                    type="text"
                    name="description"
                    placeholder="Enter description"
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td style={{border: "none"}}>
              <button className="save-btn" style={{verticalAlign: "middle"}} onClick={handleSaveNewCategory}>Save</button>
            </td>
            <td style={{border: "none"}}>
              <button style={{verticalAlign: "middle"}} onClick={handleAddNewCategory}>Cancel</button>
            </td>
        </tr>
    );    
      
      const TopicTable = () => {
        return (
          <table style={{ width: '1100px' }}>
            <thead>
              <tr>
                <th className="w-60">Category</th>
                <th className="w-96">Description</th>
                <th className="w-30">Volume</th>
                <th>Trend (coming soon)</th>
              </tr>
            </thead>
            <tbody>
            {showNewCategoryRow && <NewTableRow/>}
              {categories.slice().reverse().map((category, index) => (
                <TableRow key={index} category={category} index={index}/>
              ))}
            </tbody>
          </table>
        );
      };

      return (
        <div className='charts-content'>
          <div className='flex'>
            <p className='text-4xl mb-7'>Category Insights</p>
            {!showNewCategoryRow && !editMode ? (
              <>
                <button className='ml-auto mb-5' onClick={handleEdit}> Edit </button>
                <button className='add-btn ml-10 mb-5' onClick={handleAddNewCategory}> Add New </button>
              </>
            ) : editMode ? (
              <button className='ml-auto' onClick={handleEdit}> Done </button>
            ) : null}
          </div>
          <TopicTable />
        </div>
      );
  };
  
  export default KeyMetricCard;