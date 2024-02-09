import React from 'react';
import '../../styles/Charts.css';

const Category = () => {

    const categories = [
        {
          name: 'Lost or Stolen Card',
          description: 'Description of Lost or Stolen Card. Lost or Stolen Card. Description of Lost or Stolen Card',
          volume: '52k',
          trend: '+46%',
          path: "M0 40 L20 30 L40 34 L60 20 L80 25 L100 20 L120 0"
        },
        {
          name: 'Lost or Stolen Card',
          description: 'Description of Lost or Stolen Card. Lost or Stolen Card. Description of Lost or Stolen Card',
          volume: '52k',
          trend: '-46%',
          path: "M0 0 L20 24 L40 34 L60 20 L80 25 L100 20 L120 40"
        },
      ];    
    
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
      
      const TopicTable = () => {
        console.log(categories.map((category, index) => (
          <TableRow key={index} category={category} />
        )))
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
        <button className='add-btn ml-auto mb-5'> Add New </button>
        </div>
        <TopicTable />
        </div>
      );
  };
  
  export default Category;

  

