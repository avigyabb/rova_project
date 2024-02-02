import React from 'react';
import { Card } from 'flowbite-react';
import { Bar } from 'react-chartjs-2';

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

export default BarChartCard;