import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Bar, Line } from 'react-chartjs-2';
import '../../styles/HomeComponents/CategorySessions.css';
import { useNavigate } from 'react-router-dom';

const CategorySessions = ({ focusedCategory, setFocusedCategory }) => {
  const data = {
    labels: [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    datasets: [
      {
        label: 'Java Queries',
        data: [12, 19, 3, 5, 2, 3, 5, 34, 6, 23, 5, 6, 3, 5, 7, 9, 12, 19, 3, 5, 2],
        borderWidth: 1,
        borderColor: '#FF4415',
        backgroundColor: 'rgba(255, 68, 21, 0.2)',
      },
      {
        label: 'Spanish Speakers',
        data: [51, 51, 53, 45, 42, 43, 45, 38, 36, 33, 35, 26, 23, 25, 27, 19, 2, 9, 13, 15, 12],
        borderWidth: 1,
        borderColor: 'orange',
        backgroundColor: 'rgba(255, 68, 21, 0.2)',
      },
      {
        label: 'Python Queries',
        data: [32, 39, 33, 35, 32, 33, 35, 34, 46, 33, 45, 46, 33, 35, 37, 39, 32, 39, 33, 35, 33],
        borderWidth: 1,
        borderColor: 'blue',
        backgroundColor: 'rgba(55, 68, 255, 0.2)',
      },
    ]
  };

  const navigate = useNavigate();
  const navExplorePage = (category_name) => {
    navigate(`${process.env.REACT_APP_AUTH_HEADER}/sessions`, { state: { category_name } });
  }

  function getScoreColorHSL(score) {
    if (score < 0) {
      return '#A3A3A3';
    }
    const cappedScore = Math.max(0, Math.min(score, 100));
    const hue = (cappedScore / 100) * 120;
    const lightness = 40;
    return `hsl(${hue}, 100%, ${lightness}%)`;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'left', // can be 'top', 'bottom', 'left', 'right'
        labels: {
          color: 'black', // 'fontColor' is now 'color'
          boxWidth: 20,
          padding: 10
        }
      }
    },
    scales: {
      x: {
        ticks: {
          display: false
        },
        title: {
          display: true,
          text: 'Past 20 Days'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Session Counts'
        }
      }
    },
  };

  return (
    <>
      <div className='flex align-center' style={{paddingTop: '2%'}}>
        <button className='home-button' onClick={() => setFocusedCategory('')}> 
          <ArrowBackIosIcon style={{ fontSize: 20}}/> 
          <HomeIcon style={{ fontSize: 22, marginRight: 4 }}/> 
          <p className='text-lg'>Home</p> 
        </button>
        <button className='explore-button' onClick={() => navExplorePage(focusedCategory)}>
          See In Explore
        </button>
      </div>
      <h1 className='text-3xl' style={{marginTop: '2%', marginLeft: '3%'}}> {focusedCategory} </h1>
      <div className='chart-container'>
        <Line data={data} options={options}/>
      </div>
      <div className='chart-sessions-content flex'>
        <div className='col flex flex-col' style={{borderRight: '1px solid lightgray'}}>
          <h1 className='text-xl'> Cohorts 👨‍👩‍👧‍👦 </h1>
          <div className='subsession-card' onClick={() => navExplorePage(focusedCategory)}>
            <div>
              <h1> Spanish Speakers </h1>
              <p className='ml-auto text-gray-500 text-xs'> 10 sessions </p>
            </div>
            <h1 className='ml-auto score' style={{ color: getScoreColorHSL(14) }}> 14 </h1>
          </div>
        </div>
        <div className='col flex flex-col'> 
          <h1 className='text-xl'> Segments ⚒️ </h1>
          <div className='subsession-card' onClick={() => navExplorePage(focusedCategory)}>
            <div>
              <h1> Python Queries </h1>
              <p className='ml-auto text-gray-500 text-xs'> 17 sessions </p>
            </div>
            <h1 className='ml-auto score' style={{ color: getScoreColorHSL(87) }}> 87 </h1>
          </div>
          <div className='subsession-card' onClick={() => navExplorePage(focusedCategory)}>
            <div>
              <h1> Java Queries </h1>
              <p className='ml-auto text-gray-500 text-xs'> 7 sessions </p>
            </div>
            <h1 className='ml-auto score' style={{ color: getScoreColorHSL(43) }}> 43 </h1>
          </div>
        </div>
      </div>
    </>
  );
}

export default CategorySessions