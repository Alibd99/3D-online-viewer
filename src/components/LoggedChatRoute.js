import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ModelView from '../components/ModelViewer';

import ColorAutocomplete from '../components/ColorAutocomplete';

const LoggedChatRoute = (props) => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [content, setContent] = useState('');
  const [commands, setCommands] = useState([]);
  const [colorQuery, setColorQuery] = useState('');
  const textareaRef = useRef(null);
  const [errorMessage, setErrorMessage] = useState('');
  //const [triggerSubmit, setTriggerSubmit] = useState(false); // State to trigger submit

  let filter = ['cube', 'cylinder', 'bottle', 'ball', 'pyramid'];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim() === '') {
      alert('Please enter a search term.');
      return;
    }
    history.push(`/chat?search=${encodeURIComponent(searchTerm)}`);
  };

  const handleSubmit = (e = null) => {
    if (e) e.preventDefault();
    const parsedCommands = parseMessage(content);
    setCommands(parsedCommands);
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);

    const match = value.match(/color\s([a-z]*)$/i);
    if (match) {
      setColorQuery(match[1]);
    } else {
      setColorQuery(value.endsWith('color ') ? '' : null);
    }
  };

  const handleColorSelect = (color) => {
    const cursorPos = textareaRef.current.selectionStart;
    const textBefore = content.substring(0, cursorPos);
    const textAfter = content.substring(cursorPos);
    const newText = textBefore.replace(/color\s([a-z]*)$/i, `color ${color}`) + textAfter;

    setContent(newText);
    setColorQuery('');
    textareaRef.current.focus();
  };

  const parseMessage = (message) => {
    const commandList = message.match(/(\b\w+\b\s[^,]+)(?=,|$)/g)?.map(cmd => cmd.trim()) || [];
    const loadCommandIndex = commandList.findIndex(cmd => cmd.startsWith('load'));
    if (loadCommandIndex > 0) {
      const loadCommand = commandList.splice(loadCommandIndex, 1)[0];
      commandList.unshift(loadCommand);
    }
    return commandList.map(cmd => {
      const [action, ...params] = cmd.split(/\s+/);
      return { action, params };
    });
  };

    const handleExecutePython = async () => {
      if (!filter.some(word => content.includes(word))) {
        setErrorMessage('Error: 3D model is not found.');
        return;
      }
      setErrorMessage('');
      console.log("Content to send:", content); // Check if content is correct
      await fetch(`http://localhost:9070/execute-python`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: content,
      }).then((response) => {
        if (response.status === 200) {
          setContent("load model");
          //setTriggerSubmit(true);
          console.log("Python script executed successfully");
        } else {
          console.error("Execution failed with status:", response.status);
        }
      }).catch((error) => {
        console.error("Fetch error:", error);
      });
    };

    //const modelPath = content + '.gltf';
  
    useEffect(() => {
      if (content === "load model") {
        handleSubmit();
        setContent('');
      }
    }, [content]);

  return (
    <div className="chat">
      <h2>Search for 3D model</h2>
      <div id="model_viewer">
        <ModelView commands={commands} />
      </div>
      <div>
        <Form id="comment_form" onSubmit={handleSubmit} method="POST">
          <FloatingLabel controlId="writing_box" label="Write your text here...">
            <Form.Control
              as="textarea"
              placeholder="Write your text here"
              value={content}
              onChange={handleContentChange}
              ref={textareaRef}
              style={{ position: 'relative', height: '100px' }} // Ensure height is set
            />
            <ColorAutocomplete query={colorQuery} onSelect={handleColorSelect} />
          </FloatingLabel>
          <Button variant="primary" id="btn_send_writing_box" type="submit">
            Send
          </Button>
          <Button
            variant="secondary"
            id="btn_execute_python"
            type="button"
            onClick={handleExecutePython}
            >
              Execute Python
            </Button>
        </Form>
      </div>
    </div>
  );
};

export default LoggedChatRoute;