import React from 'react';
import { Card } from 'flowbite-react';

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

export default KeyMetricCard;