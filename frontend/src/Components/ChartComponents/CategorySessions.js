import HomeIcon from '@mui/icons-material/Home';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { Bar } from 'react-chartjs-2';
import '../../styles/HomeComponents/CategorySessions.css';
import { useNavigate } from 'react-router-dom';

const CategorySessions = ({ focusedCategory, setFocusedCategory }) => {
  const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [
      {
        label: 'Dataset 1',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const navigate = useNavigate();
  const navExplorePage = (category_name) => {
    navigate(`${process.env.REACT_APP_AUTH_HEADER}/sessions`, { state: { category_name } });
  }

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
        <Bar data={data} />
      </div>
    </>
  );
}

export default CategorySessions