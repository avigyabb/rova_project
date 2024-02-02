import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './ChartComponents/LineChartCard';
import BarChartCard from './ChartComponents/BarChartCard';
import KeyMetricCard from './ChartComponents/KeyMetricCard';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);

{/* Sample Line Data */}
const line_data = {
  labels: ['Jan 24', 'Jan 25', 'Jan 26', 'Jan 27'],
  datasets: [
    {
      label: 'Daily Active Users',
      data: [500000, 520000, 480000, 400000],
      fill: false,
      backgroundColor: 'rgb(230, 30, 30)',
      borderColor: 'rgb(230, 30, 30)',
    },
    {
      label: 'Number of Chats',
      data: [400000, 420000, 580000, 500000],
      fill: false,
      backgroundColor: 'rgb(180, 30, 250)',
      borderColor: 'rgb(180, 30, 250)',
    },
    {
      label: 'Latency Prompt 1',
      data: [400000, 420000, 580000, 500000],
      fill: false,
      backgroundColor: 'rgb(180, 30, 250)',
      borderColor: 'rgb(180, 30, 250)',
    },
    {
      label: 'Latency Prompt 2',
      data: [400000, 420000, 580000, 500000],
      fill: false,
      backgroundColor: 'rgb(180, 30, 250)',
      borderColor: 'rgb(180, 30, 250)',
    },
    {
      label: 'Latency Prompt 3',
      data: [400000, 420000, 580000, 500000],
      fill: false,
      backgroundColor: 'rgb(180, 30, 250)',
      borderColor: 'rgb(180, 30, 250)',
    },
  ],
};

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

  // Function to transform backend data to chart format
  function transformDataForChart(data) {
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

  // Transform and assign to variable
  const bar_data = transformDataForChart(barDataBackend);
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
