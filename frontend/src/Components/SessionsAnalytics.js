import SessionFiltersNew from './SessionComponents/SessionFiltersNew';
import { CircularProgress } from '@mui/material';
import { TextField } from '@mui/material';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SessionsAnalytics.css';
import { Line } from 'react-chartjs-2';
import { Legend } from 'chart.js';


const SessionsAnalytics = ({ category_name, setSessions, isLoading, setIsLoading, sqlBox, handleSqlChange, handleSqlQuery }) => {
  const [engagementTime, setEngagementTime] = useState(0);
  const [signalOptionsArrayData, setSignalOptionsArrayData] = useState([]);
  const [categoryOptionsArrayData, setCategoryOptionsArrayData] = useState([]);
  const [includedCategories, setIncludedCategories] = useState(category_name ? [category_name] : []);
  const [excludedCategories, setExcludedCategories] = useState([]);
  const [includedSignals, setIncludedSignals] = useState([]);
  const [excludedSignals, setExcludedSignals] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    const applyFilters = async() => {
      setIsLoading('Searching Relevant Sessions...');
      try {
        const params = {
          included_categories : JSON.stringify(includedCategories),
          excluded_categories : JSON.stringify(excludedCategories),
          included_signals : JSON.stringify(includedSignals),
          excluded_signals : JSON.stringify(excludedSignals),
          engagement_time : engagementTime,
        }
        console.log(process.env.REACT_APP_API_URL);
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-filtered-sessions/", {params});
        console.log(response.data.sessions)
        setSessions(response.data.sessions);
        
        // Helper function to format a Date object to a 'YYYY-MM-DD' string
        const formatDate = (date) => {
          const d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

          return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
        };

        // Initialize your dictionary for the past 7 days
        const counts = {};
        const today = new Date();
        for (let i = 0; i < 20; i++) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          counts[formatDate(date)] = 0;
        }

        // Iterate over the sessions and increment the count for each date
        response.data.sessions.forEach(session => {
          if (session.earliest_timestamp.substr(0, 10) in counts) {
            counts[session.earliest_timestamp.substr(0, 10)]++;
          }
        });

        console.log(counts)
        setCategoryCounts(counts);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading('');
      }
    }
    applyFilters();
  }, [includedCategories, excludedCategories, includedSignals, excludedSignals, engagementTime]);

  useEffect(() => {
    const getCategoryOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "categories/get-user-categories/")
        console.log(response)
      if (response.data) {
        console.log(response.data);
        setCategoryOptionsArrayData(response.data.map((category) => [category.fields.name][0]))
      }
      } catch (error) {
        console.error(error);
      }
    };
    getCategoryOptions();
  }, []);

  useEffect(() => {
    const getSignalOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-options/");
        if (response.data.options) {
          const options = response.data.options.map(option => option[0])
          setSignalOptionsArrayData(options);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getSignalOptions();
  }, []);


  const engagementTimeOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      setEngagementTime(event.target.value);
    }
  }

  const engagementTimeOnBlur = (event) => {
    setEngagementTime(event.target.value);
  }

  const data = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        label: 'Number of Sessions',
        data: Object.values(categoryCounts),
        fill: false,
        backgroundColor: '#FF4415',
        borderColor: '#FF4415',
        borderWidth: 2,
        pointRadius: 2
      },
    ],
  };

  const options = {
    scales: {
      x: {
        // To hide the x-axis labels (ticks)
        ticks: {
          display: false // This hides the tick labels but keeps the axis line
        },
        // To add a label to the x-axis
        title: {
          display: true,
          text: 'Past 20 Days' // Replace with your label
        }
      },
      y: {
        // To add a label to the y-axis
        title: {
          display: true,
          text: 'Count' // Replace with your label
        }
      }
    },
    // Other options...
  };

  return (
    <>
    <div className='sql-header' style={{background: '#001B2B'}}> Filters </div>
    <div className='filters mb-6'> 
      <div className='flex justify-between mb-3'>
        <SessionFiltersNew label="Topics Include:" setFilters = {setIncludedCategories} options = {categoryOptionsArrayData} isLoading = {isLoading} filters = {includedCategories}/>
        <SessionFiltersNew label="Topics Exclude:" setFilters = {setExcludedCategories} options = {categoryOptionsArrayData} isLoading = {isLoading} filters = {excludedCategories}/>
      </div>
      <div className='flex justify-between mb-5'>
        <SessionFiltersNew label="Events Include:" setFilters = {setIncludedSignals} options = {signalOptionsArrayData} isLoading = {isLoading} filters = {includedSignals}/>
        <SessionFiltersNew label="Events Exclude:" setFilters = {setExcludedSignals} options = {signalOptionsArrayData} isLoading = {isLoading} filters = {excludedSignals}/>
      </div>
      <div>
        <TextField
          id="outlined-number"
          label="Days since last session"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          disabled={isLoading}
          onKeyPress={engagementTimeOnKeyPress}
          onBlur={engagementTimeOnBlur}
        />
      </div>
    </div>
    <div className='sql-header' style={{background: '#001B2B'}}> Analytics </div>
    <div className='graph-card mb-6'>
      <Line data={data} options={options}/>
      {/* <p className='text-gray-500'>Summary</p> */}
    </div>
    {/* sql box */}
    {/* <div className='sql-header'> sql (cmd + enter to run) </div>
    {sqlBox ? (
      <textarea
        className="sql-response"
        value={sqlBox}
        placeholder="Write your SQL query here..."
        spellCheck="false"
        onChange={handleSqlChange}
        onKeyDown={handleSqlQuery}
      />
    ) : (
      <div className="sql-response flex justify-center items-center">
        <CircularProgress style={{ color: '#FFA189' }}/>
      </div>
    )} */}
    </>
  )
}

export default SessionsAnalytics