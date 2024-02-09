import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './ChartComponents/LineChartCard';
import BarChartCard from './ChartComponents/BarChartCard';
import KeyMetricCard from './ChartComponents/KeyMetricCard';
import Category from './ChartComponents/Category';
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

  return (
    <div className='charts-container flex'>
      <div className='home-sidebar'>
        <p> My Metrics </p>
        <button> Categories </button>
        <button> KPIs </button>
        <button> Graphs </button>
      </div>
      <Category />
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
