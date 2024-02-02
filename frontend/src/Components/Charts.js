import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './ChartComponents/LineChartCard';
import BarChartCard from './ChartComponents/BarChartCard';
import KeyMetricCard from './ChartComponents/KeyMetricCard';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);


const line_options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const bar_options = {
    indexAxis: 'x',
  };

const Charts = () => {

  const [barDataBackend, setBarData] = useState([]);
  const [lineDataBackend, setLineData] = useState([]);

  useEffect(() => {
    const fetchData = async () =>  {
      try {
        const response = await axios.get('http://localhost:8000/get-histogram/');
        setBarData(response.data.histogram);
      } catch (error) {
        console.error(error);
      } finally {
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () =>  {
      try {
        const params = {
          events: "pin_dashboard,save_dashboard",
          time_interval: "5S", // 5 seconds
        };
        const response = await axios.get('http://localhost:8000/get-num-active-users/', { params });
        setLineData(response.data.info);
      } catch (error) {
        console.error(error);
      } finally {
      }
    };
    fetchData();
  }, []);

  // Function to transform backend data to chart format
  function transformDataForBarChart(data) {
    const labels = Object.keys(data);
    const counts = Object.values(data);

    const bar_data = {
      labels: labels,
      datasets: [
        {
          label: '', // Adjust this label as needed
          data: counts,
          backgroundColor: labels.map(() => 'rgba(230, 30, 30)'), // Assuming same color for all bars, adjust as needed
        },
      ],
    };

    return bar_data;
  }

  // Function to transform backend data to line format
  function transformDataForLineChart(data) {
    const labels = Object.keys(data);
    const counts = Object.values(data);

    const line_data = {
      labels: labels,
      datasets: [
        {
          label: 'Daily Active Users',
          data: counts,
          fill: false,
          backgroundColor: 'rgb(230, 30, 30)',
          borderColor: 'rgb(230, 30, 30)',
        },
      ],
    };

    return line_data;
  }

  // Transform and assign to variable
  const bar_data = transformDataForBarChart(barDataBackend);
  const line_data = transformDataForLineChart(lineDataBackend);
  console.log(bar_data)
  return (
    <div className="flex flex-wrap gap-4 p-8">
    <LineChartCard
        title="Line Data"
        data={line_data}
        options={line_options}
      />
    <BarChartCard
        title="Bar Data"
        data={bar_data}
        options={bar_options}
      />
    </div>
  );
};

export default Charts;
