// Import React and necessary hooks
import '../../styles/SessionCard.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import '../../styles/Homepage.css';
import { useNavigate } from 'react-router';

const ModifiedSessionCard = ({ sessionId, userId, timestamp, tags, summary, sessionList, index }) => {
  const [expanded, setExpanded] = useState(false);
  
  const navigate = useNavigate();
  const handleClick = () => {
      setExpanded(!expanded);
  };
  const handleSeeMore = () => {
    navigate(`${process.env.REACT_APP_AUTH_HEADER}/trace/${userId}`, { state: { userId, sessionId, sessionList, index } });
  };

  return (
    <div className="insights-card flex flex-col" onClick={handleClick}>
        <div className="session-header flex">
          <div className="text-sm"> 👤 {userId} </div>
          <div className="insights-session self-end ml-3"> session {sessionId} </div>
          <div className="insights-date ml-auto">{timestamp}</div>
        </div>
        <div className='mt-2'>
          {tags.map((tag, index) => (
            <span key={index} className="tag">{tag}</span>
          ))}
        </div>
        {expanded && (
          <div className='insights-card-content'>
            <p className='text-gray-500 text-sm'> {summary} </p>
            <p className='see-more' onClick={handleSeeMore}> see more </p>
          </div>
        )}
   </div>
  );
};

const Homepage = ({ sessionIds }) => {
  const [sessions, setSessions] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [list, setList] = useState([]);
  const [listVolume, setListVolume] = useState([]);
  const [listScoring, setListScoring] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    // Mocking a fetch sessions details function
    const fetchFeed = async () => {
      try {
        setFeedLoading(true);
        const response = await axios.get(process.env.REACT_APP_API_URL + 'get-surfaced-sessions/');
        setSessions(response.data.sessions);
      } catch (error) {
        console.error("Failed to fetch feed: ", error);
      }
      setFeedLoading(false);
    };

    const fetchList = async () => {
      try {
        setListLoading(true);
        const categories_ranking = await axios.get(process.env.REACT_APP_API_URL + 'categories/get-categories-ranking/');
        setList(categories_ranking.data.category_score);
        setListVolume(categories_ranking.data.category_volume);
        setListScoring(categories_ranking.data.category_score_names);
        console.log(categories_ranking.data);
      } catch (error) {
        console.error("Failed to fetch list: ", error);
      }
      setListLoading(false);
    };

    fetchFeed();
    fetchList();
  }, []);

  function getScoreColorHSL(score) {
    // Ensure score is between 0 and 100
    const cappedScore = Math.max(0, Math.min(score, 100));
    // Hue from red (0) to green (120), but you can adjust the range for more subdued hues
    const hue = (cappedScore / 100) * 120;
    // Lower lightness for a darker color
    const lightness = 40; // Range from 30% to 50% instead of up to 100%
    return `hsl(${hue}, 100%, ${lightness}%)`;
  }

  const TableRow = ({ rank, category_name, score, volume, chips }) => {
    const scoreColor = getScoreColorHSL(score);

    return (
      <tr>
        <td>{rank}</td>
        <td style={{ color: scoreColor }}>
          <div className='score'>
            <p>{score}</p>
          </div>
        </td>
        <td><p className="inline-block categ-name">{category_name}</p></td>
        <td>{volume}</td>
        <td>
          {chips.slice(0, 2).map((chip) => (
            <div className="tag">{chip}</div>
          ))}...
        </td>
      </tr>
    );
  };

  const TopicTable = () => {
    return (
      <table style={{ width: '100%' }}>
        <thead>
          <tr>
            <th style={{ width: "" }}> Rank </th>
            <th style={{ width: "" }}> Score </th>
            <th style={{ width: "" }}> Category </th>
            <th style={{ width: "" }}> Volume </th>
            <th> Signals </th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(list).map((key, index) => (
            <TableRow category_name={key} score={list[key]} rank={index + 1} volume={listVolume[key]} chips={listScoring[key]}/>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className='homepage flex'>
      <div className='home-left'>
        <h1 className='text-3xl' style={{marginTop: '3%', marginLeft: '3%'}}> Welcome Back! 🎉</h1>
        {listLoading ? (
          <div className="flex flex-col items-center" style={{marginTop: '30%'}}>
            <p className='mb-8 text-gray-500'> Scoring and ranking your categories based off user sessions...</p>
            <CircularProgress style={{ color: '#FFA189' }}/>
          </div>
        ) : (
          <>
            <p className='text-gray-500' style={{width: '85%', marginTop: '4%', marginLeft: '4%'}}> Here are how your categories are doing: </p>
            <div className='table-card'>
              <TopicTable />
            </div>
          </>
        )}
      </div>
      <div className='home-right'>
        <p className='header-text text-2xl'> 📬 Your Feed </p>
          {feedLoading ? (
            <div className="sessions-container flex flex-col justify-center items-center">
              <p className='mb-8 text-sm text-gray-500' style={{width: '85%', marginTop: '-25%'}}> Surfacing important user sessions based on your topics and KPIs...</p>
              <CircularProgress style={{ color: '#FFA189' }}/>
            </div>
          ) : (
            <div className="sessions-container">
              {Object.keys(sessions).map((session_id, index) => (
                <ModifiedSessionCard
                  key={session_id}
                  sessionId={session_id}
                  userId={sessions[session_id].user_id}
                  timestamp={sessions[session_id].timestamp}
                  tags={sessions[session_id].tags}
                  summary={sessions[session_id].summary}
                  index={index}
                  sessionList={sessions}
                />
              ))}
            </div>
          )}
      </div>
    </div>
  );
};

export default Homepage;


