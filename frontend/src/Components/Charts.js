import React, { useState } from 'react';
import { Line, Bar} from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import { Card } from 'flowbite-react';

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


{/* Line Chart Card */}
const LineChartCard = ({ title, data, options }) => {
    return (
        <Card>
      <div className="flex justify-between items-center p-4">
        <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
      </div>
      <hr style={{marginTop: '-1.0rem', marginBottom: '-1.0rem'}} />
      <div className="p-4">
        <Line data={data} options={options} style={{ width: '500px', height: '400px' }} />
      </div>
    </Card>
    );
  };

{/* Bar Chart Card */}
const BarChartCard = ({ title, data, options }) => {
return (
    <Card>
      <div className="flex justify-between items-center p-4">
        <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
        <i className="fas fa-ellipsis-v" aria-hidden="true"></i> {/* You can replace with Flowbite Dropdown */}
      </div>
      <hr style={{marginTop: '-1.0rem', marginBottom: '-1.0rem'}} />
      <div className="p-4">
        <Bar data={data} options={options} style={{ width: '500px', height: '400px' }} />
      </div>
    </Card>
);
};

{/* Key Metric  Card */}
const KeyMetricCard = ({ title }) => {
    return (
      <Card>
        <div className="flex justify-between items-center p-4">
            <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
            <i className="fas fa-ellipsis-v" aria-hidden="true"></i> {/* You can replace with Flowbite Dropdown */}
        </div>
        <hr style={{marginTop: '-1.0rem', marginBottom: '-1.0rem'}} />
        <div className="p-4 text-center">
          <div className="mt-2">
            <span className="text-5xl font-bold text-gray-900">2.2K</span>
            <p className="text-sm text-gray-500 mt-2">chats</p>
          </div>
          <div className="mt-3">
            <span className="text-sm font-semibold text-green-600">↑ 2.1%</span>
          </div>
        </div>
      </Card>
    );
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
