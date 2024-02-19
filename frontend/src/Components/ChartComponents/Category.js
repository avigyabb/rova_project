import React, {useState, useEffect} from 'react';
import '../../styles/Charts.css';
import axios from  'axios';
import CircularProgress from '@mui/material/CircularProgress';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { Bar } from 'react-chartjs-2';

const Category = () => {

    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // const [newCategory, setNewCategory] = useState({ name: '', description: ''});
    const [showNewCategoryRow, setShowNewCategoryRow] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [addCategoryLoading, setAddCategoryLoading] = useState(false);

    // Fetches the category data
    const fetchData = async () =>  {
      setIsLoading(true);
        try {
          // const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user-categories/');
          const categories_response = await axios.get(process.env.REACT_APP_API_URL + 'categories/get-user-categories/');
          console.log(categories_response.data);
          // setCategoryList(response.data.categories);
          setCategoryList(categories_response.data);
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

    const handleSaveNewCategory = async () => {
        // Save new category logic here
        // For example, you can send an API request to save the new category
        // After successful save, update category list and reset new category state
        setShowNewCategoryRow(false);
        setAddCategoryLoading(true);
        const newCategory = {
            name: document.getElementById("newCategoryName").value,
            description: document.getElementById("newCategoryDescription").value,
            volume: '',
            trend: '',
            path: ''
        }
        try {
          // const response = await axios.post(process.env.REACT_APP_API_URL + 'post-user-category/', newCategory);
          const response = await axios.post(process.env.REACT_APP_API_URL + 'categories/post-user-category/', newCategory);
          console.log(response);
        } catch (error) {
          console.error(error);
        } finally {
          fetchData();
          setAddCategoryLoading(false);
        }
    };

    // Conditional rendering based on isLoading
    if (isLoading) {
      return (
        <div className="min-h-screen flex justify-center items-center">
          <CircularProgress style={{ color: '#FFA189' }}/>
        </div>
      );
    }

    const categories = categoryList.map(category => ({
        id: category.pk, // primary key
        name: category.fields.name,
        description: category.fields.description,
        volume: category.fields.volume,
        trend: category.fields.trend,
        path: category.fields.path
    })); 

    const chartData = {
      labels: categories.map(metric => metric.name),
      datasets: [
        {
          label: 'Volume',
          data: categories.map(metric => metric.volume),
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
          const response = await axios.get(process.env.REACT_APP_API_URL + 'categories/delete-user-category/', { params });
        } catch (error) {
          console.error(error);
        } finally {
          fetchData();
        }
      }
      
      const TableRow = ({ category, isCreating=false }) => (
        <tr>
          <td><p className={isCreating ? "" : "inline-block categ-name"}>{category.name}</p></td>
          <td>{category.description}</td>
          <td>{category.volume}</td>
          <td>
            {/* This would be replaced with a chart component */}
            <div className="trend-line">
              {category.trend}
              {/* <TrendLine value={category.trend} trend='up' path={category.path}/> */}
            </div>
          </td>
          <td style={{border: "none"}}>
            {editMode && <RemoveCircleIcon onClick={() => removeCategory(category.id)}/>}
          </td>
        </tr>
      );

      const NewTableRow = () => (
        <tr>
            <td>
                <input
                    id="newCategoryName"
                    type="text"
                    name="name"
                    // value={newCategoryName}
                    // onChange={handleInputChange}
                    placeholder="enter topic"
                />
            </td>
            <td style={{padding: "0"}}>
                <textarea
                    id="newCategoryDescription"
                    row="2"
                    cols="50"
                    type="text"
                    name="description"
                    // value={newCategory.description}
                    // onChange={handleInputChange}
                    placeholder="enter description"
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td style={{ border: "none", paddingLeft: "1%", width: "6%"}}>
              <button className="save-btn" style={{verticalAlign: "middle"}} onClick={handleSaveNewCategory}> Save </button>
            </td>
            <td style={{ border: "none" }}>
              <button style={{verticalAlign: "middle"}} onClick={handleAddNewCategory}>Cancel</button>
            </td>
        </tr>
    );    
      
      const TopicTable = () => {
        return (
          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: "17%" }}> Topic </th>
                <th style={{ width: "32%" }}>Description</th>
                <th style={{ width: "6%" }}>Volume</th>
                <th style={{ width: "20%" }}>Trends</th>
              </tr>
            </thead>
            <tbody>
            {addCategoryLoading && (
              <TableRow category={{name: "Creating New Category...", description: "Analyzing Description..."}} isCreating={true}/>
            )}
            {showNewCategoryRow && <NewTableRow/>}
            {categories.slice().reverse().map((category, index) => (
              <TableRow key={index} category={category}/>
            ))}
            </tbody>
          </table>
        );
      };

      return (
        <div className='charts-content' style={{}}>
          {/* something wrong with below style */}
          <div className='flex' style={{ width: "81%" }}>
            <p className='text-4xl mb-7'>Topic Insights 🗂️</p>
            {!showNewCategoryRow && !editMode ? (
              <>
                <button className='ml-auto mb-5' onClick={handleEdit}> Edit </button>
                <button className='add-btn ml-10 mb-5 w-32' onClick={handleAddNewCategory}> Add New </button>
              </>
            ) : editMode ? (
              <button className='ml-auto' onClick={handleEdit}> Done </button>
            ) : null}
          </div>
          <div style={{ width: categoryList.length > 0 || showNewCategoryRow ? "100%" : "100%"}}>
            <TopicTable />
          </div>
          <div className='flex mt-10'>
            <div className='chart-container' style={{ width: '90%', height: '400px', marginTop: '10px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      );
  };
  
  export default Category;

  

