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

function Flows() {
  const StepComponent = ({i}) => 
    <div class="headerStep" style={{ zIndex: 1000 - i }}>
      Step {i + 1}
    </div>;

  const renderedFlowBoxesCount = useRef(0);
  const [flowBoxesRendered, setFlowBoxesRendered] = useState(false);

  function FlowCol({ heights, overallClass, stepNum }) {
    useEffect(() => {
      renderedFlowBoxesCount.current += 1;
      if (renderedFlowBoxesCount.current >= flowBoxes.length) {
        setFlowBoxesRendered(true);
        renderedFlowBoxesCount.current = 0;
      }
    }, []);

    return (
      <div className={`${ overallClass }`}>
        <div class="boxSpaces"></div>
        { heights[0] > 0 && (
          <Link to={'/paths'} 
                state={{start: startState, end: endState, step: stepNum, type:"LLM"}}>
          <div id={`chat${stepNum}`} class="stepBox chatBox transitionStyle" style={{ height: `${ heights[0] }%` }}>
            <Chip icon={<ChatIcon/>} label="LLM" variant='outlined' style={{position:'absolute', backgroundColor:'white', transform:'translate(8px, 8px)', padding:'5px'}}/>
          </div>
          </Link>
        )}
        <div class="boxSpaces"></div>
        <div class="boxSpaces"></div>
        { heights[1] > 0 && (
         <Link to={'/paths'} 
          state={{start: startState, end: endState, step: stepNum, type:"Product"}}>
          <div class="stepBox productBox transitionStyle" style={{ height: `${ heights[1] }%` }}>
            <Chip icon={<DashboardIcon/>} label="Product" variant='outlined' style={{position:'absolute', backgroundColor:'white', transform:'translate(8px, 8px)', padding:'5px'}}/>
          </div>
          </Link>
        )}
        <div class="boxSpaces"></div>
        <div class="boxSpaces"></div>
        { heights[2] > 0 && (
         <Link to={'/paths'} 
          state={{start: startState, end: endState, step: stepNum, type:"Dropoff"}}>
          <div class="stepBox dropOffBox transitionStyle" style={{ height: `${ heights[2] }%` }}>
            <Chip icon={<ArrowCircleDownIcon/>} label="Dropoff" variant='outlined' style={{position:'absolute', backgroundColor:'white', transform:'translate(8px, 8px)', padding:'5px'}}/>
          </div>
          </Link>
        )}
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
        strokeWidth={50}
        //animateDrawing={true}
      />
    );
  }

  const [componentsCount, setComponentsCount] = useState(0);

  const addComponent = () => {
      setComponentsCount(componentsCount + 1);
  };

  const steps = [];
  const flowBoxes = [];
  console.log("hello");
  flowBoxes.push(<FlowCol key={0} stepNum='1000' heights={[78, 0, 0]} overallClass="step"/>)
  for (let i = 0; i < componentsCount; i++) {
    steps.push(<StepComponent key={i} i={i}/>);
    flowBoxes.push(<FlowCol key={i} stepNum={i} heights={[38, 20, 12]} overallClass="step innerStep"/>)
  }
  flowBoxes.push(<FlowCol key={0} stepNum='1001' heights={[78, 0, 0]} overallClass="step ml-auto"/>)

  const arrows_data = [
    ["chat1000", "chat0", "80%"],
    ["chat0", "chat1", "50%"]
  ];
  const arrows = []; // array of arrows to be rendered
  for (let i = 0; i < Math.min(componentsCount, arrows_data.length); i++) {
    arrows.push(
      <Arrow start={arrows_data[i][0]} end={arrows_data[i][1]} percentage={arrows_data[i][2]} />
    )
  }

  const [startState, setStartState] = useState(""); // State to store the selected option
  const [endState, setEndState] = useState("");

  // Event handler to update the selected option
  const handleStartChange = (event) => {
    setStartState(event.target.value);
  };
  const handleEndChange = (event) => {
    setEndState(event.target.value);
  };

  return (
      <div class="h-screen">
          <div class="header flex flex-row">
            <div class="beginState">
              <select class="" id="startDropdown" value={startState} onChange={handleStartChange}>
                <option value="">Start</option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
              </select>
            </div>
            {steps}
            <button class="h-full" onClick={addComponent}> <CgAddR class="h-8 w-8 ml-6 thin-icon" /> </button>
            <div class="endState ml-auto">
              <select class="state bg-gray-200" id="endDropdown" value={endState} onChange={handleEndChange}>
                <option value="">End</option>
                <option value="Option 1">Option 1</option>
                <option value="Option 2">Option 2</option>
                <option value="Option 3">Option 3</option>
              </select>
            </div>
          </div>
          <div class="flex flex-row h-full">
            {flowBoxes}
          </div>
          {flowBoxesRendered && arrows}
      </div>
  );
}

export default Flows;