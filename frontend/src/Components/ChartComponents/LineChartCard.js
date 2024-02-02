import React from 'react';
import { Card } from 'flowbite-react';
import { Line } from 'react-chartjs-2';

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

export default LineChartCard;