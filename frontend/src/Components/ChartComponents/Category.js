import React, {useState, useEffect} from 'react';
import '../../styles/Charts.css';
import axios from  'axios';
import CircularProgress from '@mui/material/CircularProgress';

const Category = () => {

    const [categoryList, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', volume: '', trend: '', path: '' });
    const [showNewCategoryRow, setShowNewCategoryRow] = useState(false);

    useEffect(() => {
        const fetchData = async () =>  {
        setIsLoading(true);
          try {
            const response = await axios.get(process.env.REACT_APP_API_URL + 'get-user-categories/');
            setCategories(response.data.categories);
          } catch (error) {
            console.error(error);
          } finally {
            setIsLoading(false);
          }
        };
        fetchData();
      }, []);

    const handleAddNewCategory = () => {
        setShowNewCategoryRow(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewCategory((prevCategory) => ({
            ...prevCategory,
            [name]: value,
        }));
    };    

    const handleSaveNewCategory = () => {
        // Save new category logic here
        // For example, you can send an API request to save the new category
        // After successful save, update category list and reset new category state
        setShowNewCategoryRow(false);
        setCategories((prevCategories) => [...prevCategories, newCategory]);
        setNewCategory({ name: '', description: '', volume: '', trend: '', path: '' });
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
        name: category.name,
        description: category.description,
        volume: '52k', // Example volume
        trend: '+46%', // Example trend
        path: "M0 40 L20 30 L40 34 L60 20 L80 25 L100 20 L120 0" // Example path
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
      
      const TableRow = ({ category }) => (
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
        </tr>
      );

      const NewTableRow = () => (
        <tr>
            <td>
                <input
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    placeholder="Enter category"
                />
            </td>
            <td>
                <input
                    type="text"
                    name="description"
                    value={newCategory.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                />
            </td>
            <td>-</td>
            <td>-</td>
            <td>
                <button onClick={handleSaveNewCategory}>Save</button>
            </td>
        </tr>
    );    
      
      const TopicTable = () => {
        return (
          <table>
            <thead>
              <tr>
                <th className="w-60">Category</th>
                <th className="w-96">Description</th>
                <th className="w-30">Volume</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
            {showNewCategoryRow && <NewTableRow/>}
              {categories.map((category, index) => (
                <TableRow key={index} category={category} />
              ))}
            </tbody>
          </table>
        );
      };

      return (
        <div className='charts-content'>
        <div className='flex'>
        <p className='text-4xl mb-7'>Category Insights</p>
        <button className='add-btn ml-auto mb-5' onClick={handleAddNewCategory}> Add New </button>
        </div>
        <TopicTable />
        </div>
      );
  };
  
  export default Category;

  

