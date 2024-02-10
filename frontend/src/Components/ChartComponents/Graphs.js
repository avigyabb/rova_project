import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend} from 'chart.js';
import LineChartCard from './LineChartCard';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, PointElement, BarElement, LineElement, Title, Tooltip, Legend);


const line_options = {
    layout: {
        padding: {
          top: 15,
          right: 15,
          bottom: 15,
          left: 15
        }
    },
  scales: {
    y: {
      beginAtZero: true,
    },
    x: {
      // Assuming 'x' is your label axis
      ticks: {
        autoSkip: true,
        maxTicksLimit: 5 // Limits the maximum number of ticks to 5
      },
  },
}
};

const Charts = () => {

  // const [barDataBackend, setBarData] = useState([]);
  const [lineDataBackend, setLineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  var timestamps = []
  useEffect(() => {
    setIsLoading(true)
    const fetchData = async () =>  {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-metrics/');
        setLineData(response.data.lines);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false)
        console.log(lineDataBackend)
      }
    };
    fetchData();
  }, []);

  if(!isLoading && lineDataBackend.length > 0) {
    timestamps = Object.keys(lineDataBackend[0][1]);
    }

  // Function to transform backend data to line format
  function transformDataForLineChart(dataArray) {
    const lineData = {
      labels: timestamps.map(date =>
      format(parseISO(date.toString()), 'PPP') // 'PPP' is one of many format strings supported by date-fns; it produces output like "June 7th, 2020"
      ), // Extracting labels from tuples
      datasets: dataArray.map(([label, counts], index) => ({
        label: label,
        data: Object.values(counts),
        fill: false,
        backgroundColor: 'rgba(255, 165, 0, 0.6)',
        borderColor: 'rgba(255, 165, 0, 0.6)',
      })),
    };
    console.log(dataArray)
    return lineData;
  }

  // Transform and assign to variable
  // const bar_data = transformDataForBarChart(barDataBackend);
  const line_data = transformDataForLineChart(lineDataBackend);

  return (
    <div className="flex flex-wrap gap-4 p-8">
    <LineChartCard
        title="Daily Metrics (beta)"
        data={line_data}
        options={line_options}
      />
    </div>
  
  );
};

export default Charts;