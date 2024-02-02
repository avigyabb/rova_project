import React, { useState } from 'react';
import { Card } from 'flowbite-react';
import { Line } from 'react-chartjs-2';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

{/* Line Chart Card */}
const LineChartCard = ({ title, data, options }) => {
  const [selectedData, setSelectedData] = useState(Object.keys(data.datasets).reduce((acc, curr) => {
    acc[curr] = true;
    return acc;
  }, {}));

  return (
    <Card>
      <div className="p-4">
        <h5 className="text-xl font-semibold leading-tight text-gray-900">{title}</h5>
        <hr style={{marginTop: '0.5rem', marginBottom: '0.0rem', width: '100%'}} />
        <div className="flex flex-col items-center">
          <div className="p-4">
            <Line data={{
              ...data,
              datasets: data.datasets.filter(dataset => selectedData[dataset.label])
            }} options={options} style={{ width: '500px', height: '400px' }} />
          </div>
        </div>
        <div className="flex flex-col items-center" style={{margin: '0 auto'}}>
        <Autocomplete
          multiple
          id="checkboxes-tags-demo"
          options={data.datasets.map((option) => option.label)}
          disableCloseOnSelect
          getOptionLabel={(option) => option}
          style={{ width: 300 }}
          renderInput={(params) => (
            <TextField {...params} variant="outlined" label="Select data" placeholder="Select data" />
          )}
          onChange={(event, value) => {
            setSelectedData(prevData => data.datasets.reduce((acc, curr) => {
              acc[curr.label] = value.includes(curr.label);
              return acc;
            }, {}));
          }}
        />
        </div>
      </div>
    </Card>
  );
};

export default LineChartCard;