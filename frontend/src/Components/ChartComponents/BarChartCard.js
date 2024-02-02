import React from 'react';
import { Card } from 'flowbite-react';
import { Bar } from 'react-chartjs-2';

const BarChartCard = ({ title, data }) => {
  const options = {
    scales: {
      x: { // For Chart.js version 3.x and react-chartjs-2 v4.x, it's `x` instead of `xAxes`
        ticks: {
          display: false // This will hide the x-axis labels
        },
        grid: {
          display: false, // Optionally, you can also hide the grid lines for the x-axis
        },
      },
    },
    maintainAspectRatio: false // This is useful if you're setting specific dimensions
  };

  return (
      <Card className="border rounded border-gray-300">
        <div className="flex justify-between items-center p-4">
          <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
        </div>
        <hr style={{marginTop: '-1.0rem', marginBottom: '-1.0rem'}} />
        <div className="p-4">
          <Bar data={data} options={options} style={{ width: '500px', height: '400px' }} />
        </div>
      </Card>
  );
};

export default BarChartCard;
