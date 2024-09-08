import express from 'express';
import bodyParser from 'body-parser'; // For parsing plain text bodies
import cors from 'cors';
import { exec } from 'child_process';
import cryptoJS from 'crypto-js';
import OpenAI  from 'openai';
import { writeFileSync } from 'fs';
import path from 'path';


import fs from 'fs';

const app = express();
const port = 9070;

// Configure CORS
app.use(
  cors({
    origin: ['http://localhost:3000'], // Update with the correct client origin
    credentials: true,
    methods: 'GET, POST', // Define allowed methods
    optionsSuccessStatus: 200, // For compatibility with some legacy browsers
  })
);

app.use(bodyParser.text());

// Use JSON parsing middleware
app.use(express.json());

app.post('/execute-python', async (req, res) => {
  
  let description = req.body;

  let filter = ['cube', 'cylinder', 'bottle', 'ball', 'pyramid'];
  
  if(filter.includes(description))
    {

   

      exec(`blender -b -P ${description}.py`, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Blender command: ${error}`);
          res.status(500).send('Failed to execute Blender command');
          return;
        }
        console.log(`Blender command output: ${stdout}`);
        res.send('Blender command executed successfully');
        
      });
    }else{
      console.error(`Error filter check command`);
      res.status(500).send('Failed to execute Blender command');
    }

 
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use([
    "/execute-blender",
    "/execute-python"    
    ], (req, res) => {
    res.sendStatus(405);
});

app.use((req, res) => {
    res.sendStatus(404);
});

export { app };