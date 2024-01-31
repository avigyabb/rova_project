import { useState } from "react";

function Sidebar() {
    const StepComponent = () => <div>Step Component</div>;
    const [componentsCount, setComponentsCount] = useState(0);

    const addComponent = () => {
        setComponentsCount(componentsCount + 1);
    };

    const steps = [];
    for (let i = 0; i < componentsCount; i++) {
        steps.push(<StepComponent key={i} />);
    }

    return (
        <div>
            Sidebar
            {steps}
            <button onClick={addComponent}>Add Step</button>
        </div>
    );
};

export default Sidebar;