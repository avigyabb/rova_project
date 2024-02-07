import React, { useState, useHistory } from 'react';
import { Card } from 'flowbite-react';
import { Bar } from 'react-chartjs-2';
import "../../styles/EventComponentsStyles/BarChardCard.css";

const BarChartCard = ({ title, data }) => {

  const options = {
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        // this might not work
        window.location.href = `/${process.env.REACT_APP_AUTH_HEADER}/sessions`;
      }
    },
    scales: {
      x: {
        ticks: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
    maintainAspectRatio: false,
  };
  

  return (
    <div className='wrapper'>
      <Card className="border rounded border-gray-300">
        <div className="flex justify-between items-center p-4">
          <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
        </div>
        <hr style={{marginTop: '-1.0rem', marginBottom: '-1.0rem'}} />
        <div className="p-4">
        <Bar data={data} options={options} style={{ width: '500px', height: '400px' }} />
        </div>
      </Card>
    </div>
  );
};

export default BarChartCard;
