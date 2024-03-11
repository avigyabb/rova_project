import FileUpload from "./FileUpload";
import './MiniProjects.css';
import { Link } from 'react-router-dom';

const MiniProjects = () => {

  return (
    <div className="flex h-screen">
      <div className="left-content pt-5 pl-10">
        <Link to={`/`} className="font-bold text-4xl text-gray-100"> rova </Link> 
        <h1 className='text-6xl text-gray-500 font-bold' style={{width: '80%', marginLeft: '5%', marginTop: '25%', lineHeight: '1.5'}}> Analyze Your Chat Logs In 24 Hours </h1>
      </div>
      <div className='signup-form'>
          <FileUpload />
          <p className='mt-5'>Not working? Email us at <a href="mailto:founders@rovaai.com" style={{color: '#FF8263'}}>founders@rovaai.com</a></p>
      </div>
    </div>
  )
}

export default MiniProjects