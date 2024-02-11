import '../styles/Flows.css';
import { useState, useEffect, useRef } from 'react';
import { CgAddR } from "react-icons/cg";
import axios from 'axios';
import Xarrow from 'react-xarrows';
import { Chip } from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown';
import { Link } from 'react-router-dom'; // Import Link
import CircularProgress from '@mui/material/CircularProgress'

function Flows() {
  const StepComponent = ({i}) => 
    <div class="headerStep" style={{ zIndex: 1000 - i }}>
      Step {i + 1}
    </div>;

  const renderedFlowBoxesCount = useRef(0);
  const [flowBoxesRendered, setFlowBoxesRendered] = useState(false);

  function FlowCol({ overallClass, stepNum, heights }) {
    renderedFlowBoxesCount.current += 1;
    if (renderedFlowBoxesCount.current >= flowBoxes.length) {
      setFlowBoxesRendered(true);
      renderedFlowBoxesCount.current = 0;
      setFlowBoxesRendered(false);
    }

    function Box({height, eventName}) {
      var color = "";
      if (eventName == "dropoff") {
        color = "dropOffBox";
      } else if (eventName == "LLM Trace") {
        color = "chatBox";
      } else {
        color = "productBox";
      }
      color = "stepBox " + color + " transitionStyle";

      // label is what is shown on the box
      return (
        <Link to={`${process.env.REACT_APP_AUTH_HEADER}/paths`} state={{start : startState, end : endState, step : stepNum, numSteps : columnsCount + 2, event : eventName}}>
          <div id={`${eventName}${stepNum}`} class = {color} style={{height : `${height}%`}}>
              <Chip icon = {<ChatIcon/>} label={eventName} variants="outlined" style={{position:"absolute", backgroundColor:"white", transform:"translate(8px, 8px)", padding:"5px"}}/>
          </div>
        </Link>
      );
    }

    var boxes = []
    for (let i = 0; i < heights.length; i++) {
      boxes.push(<div class="boxSpaces" ></div>);
      boxes.push(<Box height = {heights[i][1]} eventName = {heights[i][0]}/>);
      boxes.push(<div class="boxSpaces" ></div>);
    }

    return (
      <div className={`${ overallClass }`}>
        {boxes}
      </div>
    );
  }

  function Arrow({ start, end, percentage}) {
    return (
      <Xarrow
        start={start}
        end={end}
        labels={percentage}
        startAnchor={'right'}
        endAnchor={'left'}
        color={'#FFD0C4'}
        showHead={false}
        strokeWidth={1}
        //animateDrawing={true}
      />
    );
  }
  
  const [columnsCount, setColumnsCount] = useState(0);

  const addColumn = () => {
      setColumnsCount(columnsCount + 1);
  };  
  
  const steps = [];
  const flowBoxes = [];
  const [flowBoxesData, setFlowBoxesData] = useState({});

  const arrows = []; // array of arrows to be rendered
  const [arrowsData, setArrowsData] = useState([]);    
  
  const [startState, setStartState] = useState(""); // State to store the selected option
  const [endState, setEndState] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getPercentages = async() => {
      setIsLoading(true);
      try {
        const params = {
          num_steps : columnsCount + 2,
          start_event_name : startState,
          end_event_name : endState,
        }
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-percentages/", {params});
        setArrowsData(response.data.arrow_percentages);
        console.log(response.data.arrow_percentages);
        setFlowBoxesData(response.data.box_percentages);
        console.log(response.data.box_percentages);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (startState != "" && endState != "") {
      getPercentages();
    } else {
      setFlowBoxesData([]);
      setArrowsData([]);
      setColumnsCount(0);
    }
  }, [columnsCount, startState, endState]);  

  if (flowBoxesData.length == (columnsCount + 2)) {
    for (let i = 0; i < columnsCount + 2; i++) {
      var overallClass;
      if (i > 0 && i < columnsCount + 1) {
        steps.push(<StepComponent key={i - 1} i={i - 1}/>);
        overallClass = "step innerStep";
      } else if (i == 0) {
        overallClass = "step";
      } else {
        overallClass = "step ml-auto";
      }
      flowBoxes.push(<FlowCol key={i} stepNum={i} overallClass={overallClass} heights={flowBoxesData[i]}/>)
    }
  }
  
  for (let i = 0; i < arrowsData.length; i++) {
    arrows.push(<Arrow start={arrowsData[i][0]} end={arrowsData[i][1]} percentage={arrowsData[i][2]} />)
  }

  // Event handler to update the selected option
  const handleStartChange = (event) => {
    setStartState(event.target.value);
  };
  const handleEndChange = (event) => {
    setEndState(event.target.value);
  };

  const optionsArray = []
  const [optionsArrayData, setOptionsArrayData] = useState([]);

  useEffect(() => {
    const getOptions = async() => {
      try {
        const response = await axios.get(process.env.REACT_APP_API_URL + "get-options/");
        response.data.options.push(["LLM Trace"]);
        setOptionsArrayData(response.data.options);
      } catch (error) {
        console.error(error);
      }
    };
    getOptions();
  }, []);
           
  optionsArrayData.forEach((option) =>
    optionsArray.push(<option value={option}>{option}</option>)
  ) 

  // if (isLoading) {
  //   return <div className="nin-h flex justify-center items-center" style = {{margin : "auto", position : "absolute", top : "0", bottom : "0", left : "0", right : "0"}}>
  //     <CircularProgress size = "5rem" style = {{color : "#FFA189"}}/>
  //   </div>
  // }

  return (
      <div class="h-screen">
          <div class="header flex flex-row">
            <div class="beginState">
              <select class="" id="startDropdown" value={startState} onChange={handleStartChange}>
                <option value="">Start Event</option>
                {optionsArray}
              </select>
            </div>
            {steps}
            {!isLoading && <button class="h-full" onClick={addColumn}> <CgAddR class="h-8 w-8 ml-6 thin-icon" /> </button>}
            <div class="endState ml-auto">
              <select class="state bg-gray-200" id="endDropdown" value={endState} onChange={handleEndChange}>
                <option value="">End Event</option>
                {optionsArray}
              </select>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center" style = {{margin : "auto", position : "absolute", top : "0", bottom : "0", left : "0", right : "0"}}>
              <CircularProgress size = "5rem" style = {{color : "#FFA189"}}/>
            </div>
          ) : (
            <>
            <div class="flex flex-row h-full">
              {flowBoxes}
            </div>
            {arrows}
            </>
          )}
      </div>
  );
}

export default Flows;