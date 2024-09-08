import React from 'react';
import { useHistory } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';
import '/home/alosh/projects1/exam/src/IntroRoute.css';  // Ensure you import the new CSS file

const IntroRoute = () => {
  const history = useHistory();

  const handleClick = () => {
    history.push("/chat"); // Redirect to the chat page
  }

 
  return (
    <div className="intro-page">
      <h1 className="intro-title">Welcome to Our Imaginative Website</h1>
      <p className="intro-instructions">
        <strong>How to use commands in the Textbox</strong>
        <br /><br />
        To interact with the 3D model, you can use the following commands:
        <ul>
          <li><strong className="command-text">Load a model:</strong> Enter <code className="command-text">load model_name</code > to load a specific model.</li>
          <li><strong className="command-text">Change color:</strong> Enter <code className="command-text">color color_name</code> to choose a color from the palette (e.g., <code className="command-text">color red</code>).</li>
          <li><strong className="command-text">Resize the model:</strong> Enter <code className="command-text"> resize X Y Z</code> to resize the model by specifying dimensions.</li>
        </ul>
        <strong>Usage:</strong> <code className="command-text">load model_name, color color_name, resize x y z</code>
      </p>
      <p className="intro-description">
        This is a place where your imagination can run wild! Explore and create with us.
      </p>
      <button className="intro-button" onClick={handleClick}>Use your imagination</button>
    </div>
  );
};
export default IntroRoute;
