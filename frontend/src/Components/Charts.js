import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './ChartComponents/LineChartCard';
import BarChartCard from './ChartComponents/BarChartCard';
import KeyMetricCard from './ChartComponents/KeyMetricCard';
import '../styles/Charts.css';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);


const line_options = {
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      // Assuming 'x' is your label axis
      ticks: {
        autoSkip: true,
        maxTicksLimit: 5 // Limits the maximum number of ticks to 5
      },
  },
}
};

// const bar_options = {
//     indexAxis: 'x',
//   };

const Charts = () => {

  // const [barDataBackend, setBarData] = useState([]);
  const [lineDataBackend, setLineData] = useState([]);
  const [dates, setDates] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () =>  {
  //     try {
  //       const response = await axios.get('http://localhost:8000/get-histogram/');
  //       setBarData(response.data.histogram);
  //     } catch (error) {
  //       console.error(error);
  //     } finally {
  //     }
  //   };
  //   fetchData();
  // }, []);

  useEffect(() => {
    const fetchData = async () =>  {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-metrics/');
        setLineData(response.data.lines);
        setDates(response.data.dates)
      } catch (error) {
        console.error(error);
      } finally {
      }
    };
    fetchData();
  }, []);

  // Function to transform backend data to chart format
  // function transformDataForBarChart(data) {
  //   const labels = Object.keys(data);
  //   const counts = Object.values(data);

  //   const bar_data = {
  //     labels: labels,
  //     datasets: [
  //       {
  //         label: '', // Adjust this label as needed
  //         data: counts,
  //         backgroundColor: labels.map(() => 'rgba(230, 30, 30)'), // Assuming same color for all bars, adjust as needed
  //       },
  //     ],
  //   };

  //   return bar_data;
  // }

  // Function to transform backend data to line format
  function transformDataForLineChart(dataArray) {
    const lineData = {
      labels: dates.map(date =>
      format(parseISO(date.toString()), 'PPP') // 'PPP' is one of many format strings supported by date-fns; it produces output like "June 7th, 2020"
      ), // Extracting labels from tuples
      datasets: dataArray.map(([label, counts], index) => ({
        label: label,
        data: Object.values(counts),
        fill: false,
        backgroundColor: 'rgb(230, 30, 30)',
        borderColor: 'rgb(230, 30, 30)',
      })),
    };
    return lineData;
  }

  // Transform and assign to variable
  // const bar_data = transformDataForBarChart(barDataBackend);
  const line_data = transformDataForLineChart(lineDataBackend);

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
    <div className='charts-container flex'>
      <div className='home-sidebar'>
        <p> My Metrics </p>
        <button> Categories </button>
        <button> KPIs </button>
        <button> Graphs </button>
      </div>
      <div className='charts-content'>
        <div className='flex'>
        <p className='text-4xl mb-7'>Category Insights</p>
        <button className='add-btn ml-auto mb-5'> Add New </button>
        </div>
        <TopicTable />
      </div>
    </div>
    // <div className="flex flex-wrap gap-4 p-8">
    // <LineChartCard
    //   title="Daily Metrics (beta)"
    //   data={line_data}
    //   options={line_options}
    // />
    // </div>
  
  );
};

export default Charts;
