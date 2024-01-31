import './App.css';
import Sidebar from './Components/sidebar';
import { useState } from 'react';
import Xarrow from 'react-xarrows';
import { CgAddR } from "react-icons/cg";

function App() {
  const StepComponent = ({i}) => 
    <div class="headerStep" style={{ zIndex: 1000 - i }}>
      Step {i + 1}
    </div>;
  
  const divStyle = {
    backgroundColor: '#3498db',
    color: '#fff',
    fontSize: '24px',
    padding: '10px',
  };

  const FlowCol = ({heights, overallClass}) => 
    <div className={`${ overallClass }`}>
      <div class="boxSpaces"></div>
      { heights[0] > 0 && (
        <div id="chat" class="stepBox bg-blue-200 rounded" style={{ height: `${ heights[0] }%` }}>
          Chat
        </div>
      )}
      <div class="boxSpaces"></div>
      <div class="boxSpaces"></div>
      { heights[1] > 0 && (
        <div class="stepBox bg-green-200 rounded" style={{ height: `${ heights[1] }%` }}>
          Product
        </div>
      )}
      <div class="boxSpaces"></div>
      <div class="boxSpaces"></div>
      { heights[2] > 0 && (
        <div class="stepBox bg-yellow-200 rounded" style={{ height: `${ heights[2] }%` }}>
          Dropoff
        </div>
      )}
    </div>;
  
  const [componentsCount, setComponentsCount] = useState(0);

  const addComponent = () => {
      setComponentsCount(componentsCount + 1);
  };

  const steps = [];
  const flowBoxes = [];
  flowBoxes.push(<FlowCol key={0} heights={[78, 0, 0]} overallClass="step h-full"/>)
  for (let i = 0; i < componentsCount; i++) {
    steps.push(<StepComponent key={i} i={i}/>);
    flowBoxes.push(<FlowCol key={i} heights={[40, 20, 18]} overallClass="step innerStep h-full"/>)
  }
  flowBoxes.push(<FlowCol key={0} heights={[78, 0, 0]} overallClass="step ml-auto h-full"/>)

  // const arrows_data = [
  //   ["chat", "endDropdown", "80%"]
  // ];
  const arrows = [];
  // for (let i = 0; i < componentsCount; i++) {
  //   arrows.push(
  //     <Xarrow
  //       start={arrows_data[i][0]} //can be react ref
  //       end={arrows_data[i][1]} //or an id
  //       labels={arrows_data[i][2]}
  //     />
  //   )
  // }

  const events = [
    "open chat",
    "pin dashboard"
  ];

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
        {arrows}
    </div>
  );
}

export default App;