import './App.css';
import Sidebar from './Components/sidebar';
import { useState } from 'react';
import Xarrow from 'react-xarrows';

function App() {
  const StepComponent = () => 
    <div class="step mr-8 bg-gray-200 p-4">
      Step
    </div>;
  
  const FlowCol = () => 
    <div class="step mr-8">
      <div id="chat" class="bg-blue-200 p-4 rounded mt-8">
        Chat
      </div>
      <div class="bg-green-200 p-4 rounded mt-8">
        Product
      </div>
      <div class="bg-yellow-200 p-4 rounded mt-8">
        Dropoff
      </div>
    </div>;
  
  const [componentsCount, setComponentsCount] = useState(0);

  const addComponent = () => {
      setComponentsCount(componentsCount + 1);
  };

  const steps = [];
  const flowBoxes = [];
  for (let i = 0; i < componentsCount; i++) {
      steps.push(<StepComponent key={i} />);
      flowBoxes.push(<FlowCol key={i} />)
  }

  const arrows_data = [
    ["chat", "endDropdown", "80%"]
  ];
  const arrows = [];
  for (let i = 0; i < componentsCount; i++) {
    arrows.push(
      <Xarrow
        start={arrows_data[i][0]} //can be react ref
        end={arrows_data[i][1]} //or an id
        labels={arrows_data[i][2]}
      />
    )
  }

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
    <div>
        <div class="flex flex-row">
          <h2 class="step p-2">Start State</h2>
          {steps}
          <button class="p-2" onClick={addComponent}> Add </button>
          <h2 class="step p-2 ml-auto">End State</h2>
        </div>
        <div class="flex flex-row">
          <select class="step" id="startDropdown" value={startState} onChange={handleStartChange}>
            <option value="">Start</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </select>
          {flowBoxes}
          <select class="step ml-auto" id="endDropdown" value={endState} onChange={handleEndChange}>
            <option value="">End</option>
            <option value="Option 1">Option 1</option>
            <option value="Option 2">Option 2</option>
            <option value="Option 3">Option 3</option>
          </select>
        </div>
        {arrows}
        {/* <Xarrow
          start="chat" //can be react ref
          end="endDropdown" //or an id
        /> */}
    </div>
  );
}

export default App;
