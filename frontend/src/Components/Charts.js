import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './ChartComponents/LineChartCard';
import BarChartCard from './ChartComponents/BarChartCard';
import KeyMetricCard from './ChartComponents/KeyMetricCard';

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
  ],
};

const line_options = {
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

{/* Sample Bar Chart Data */}
const bar_data = {
    labels: ['upload video', 'create playlist', 'new video editor'],
    datasets: [
      {
        label: 'Overall - 12.73%',
        data: [100, 27.17, 46.86], // Replace these data points with your actual data
        backgroundColor: [
          'rgba(230, 30, 30)',
          'rgba(230, 30, 30)',
          'rgba(230, 30, 30)'
        ],
      },
    ],
  };
  
const bar_options = {
    indexAxis: 'x',
  };

const Charts = () => {
  return (
    <div className="flex flex-wrap gap-4 p-8">
    <LineChartCard
        title="Line Data"
        data={line_data}
        options={line_options}
      />

    <BarChartCard
        title="Bar Chart Title"
        data={bar_data}
        options={bar_options}
      />
    
    <KeyMetricCard
        title="Messages"
    />
    </div>
  );
};

export default Charts;
