import React from 'react';
import '../styles/UserCard.css'; // Make sure to create this CSS file
import { useNavigate } from 'react-router';

const UserCard = ({ user, sessionCount }) => {

    const navigate = useNavigate();

    const handleClick = () => {
      navigate(`/trace/${user.id}`, { state: { user, sessionCount } });
    };
    return (
      <div className="user-card" onClick={handleClick}>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-email">{user.email}</div>
        </div>
        <div className="user-meta">
          <div className="user-updated">{user.updatedAt}</div>
          <div className="user-country">{user.country}</div>
          <div className="user-region">{user.region}</div>
          <div className="user-sessions">Sessions: {sessionCount}</div>
        </div>
      </div>
    );
  };
  
  export default UserCard;
