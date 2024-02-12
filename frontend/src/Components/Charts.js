import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import KeyMetricCard from './ChartComponents/KeyMetricCard';
import Sequences from './ChartComponents/Sequences';
import Category from './ChartComponents/Category';
import Graphs from './ChartComponents/Graphs';
import Homepage from './ChartComponents/Homepage';
import Settings from './ChartComponents/Settings';
import '../styles/Charts.css';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import TopicIcon from '@mui/icons-material/Topic';
import StarsIcon from '@mui/icons-material/Stars';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsIcon from '@mui/icons-material/Settings';

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
  // const line_data = transformDataForLineChart(lineDataBackend);

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
  
 // State to track the current view
 const [currentView, setCurrentView] = useState('homepage'); // default view

 // Function to change the current view
 const changeView = (view) => setCurrentView(view);

return (
  <div className='charts-container flex'>
    <div className='home-sidebar flex flex-col' >
      <p onClick={() => changeView('homepage')}>Homepage</p>
      <div className='link flex' onClick={() => changeView('categories')}>
        <TopicIcon className='mr-4 ml-5'/>
        <button className="text-lg"> Topics </button>
      </div>
      <div className='link flex' onClick={() => changeView('kpis')}>
        <StarsIcon className='mr-4 ml-5'/>
        <button className="text-lg">KPIs</button>
      </div>
      <div className='link flex' onClick={() => changeView('graphs')}>
        <InsightsIcon className='mr-4 ml-5'/>
        <button className="text-lg" >Graphs</button>
      </div>
      <div className='link flex mt-auto' onClick={() => changeView('settings')}>
        <SettingsIcon className='mr-2 ml-3'/>
        <button className="text-sm"> Settings </button>
      </div>
     </div>
     <div className='homepage-overall-content'>
       {currentView === 'homepage' && <Homepage />}
       {currentView === 'categories' && <Category/>}
       {currentView === 'kpis' && <KeyMetricCard />}
       {/* currentView === 'sequences' && <Sequences />} */}
       {currentView === "graphs" && <Graphs />}
       {currentView === "settings" && <Settings />}
     </div>
   </div>
 );
}

export default Charts;
