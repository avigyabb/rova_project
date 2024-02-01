import { useLocation } from 'react-router-dom';

function Paths() {
  const location = useLocation();
  const { start, end, step, type } = location.state || {}; // Fallback to empty object if state is undefined
  return <div>Start: {start}, End: {end}, Step#: {step}, Type: {type}</div>;
};

export default Paths;

