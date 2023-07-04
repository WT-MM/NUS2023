import React, { useEffect, useState } from 'react';
import './App.css';
import { app } from './firebase';
import { doc, getFirestore, setDoc, getDoc} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import LLMOutput from './LLMOutput'






function App() {
  const [sessionId, setSessionId] = useState('');
  const [caption, setCaption] = useState('');
  const [outputs, setOutputs] = useState([]);


  const db = getFirestore(app);
  
  useEffect(() => {
    const sessionId = generateSessionId();
    setSessionId(sessionId);

    getOptions();

    return () => {
      cleanupSessionData(sessionId);
    };
  }, []);

  const handleOptionSelect = async (winner, loser) => {
    console.log(sessionId)
    const docRef = doc(db, 'test',sessionId)
    const docInfo = await getDoc(docRef);
    if (!docInfo.exists()) {
      console.log("No such document!");
      setDoc(doc(db, 'test',sessionId), {
        'winner': [winner],
        'loser': [loser]
      });
    }else{
      var newData = docInfo.data();
      console.log(newData)
      console.log(newData['winner'])
      newData['winner'].push(winner);
      newData['loser'].push(loser);
      setDoc(doc(db, 'test',sessionId), newData);
    }

    getOptions()

  };

  const generateSessionId = () => {
    const sessionId = uuidv4().replace(/\\/g, '');
    return sessionId;
  };

  const cleanupSessionData = (sessionId) => {
    //Do something i guess
  };

  const getOptions = async () => {
    const docData = await getDoc(doc(db, 'data','mm'))
    const data = docData.data();
    const option1 = {'model': 's', 'prompt': 's', 'output': 's'}
    const option2 = {'model': 's', 'prompt': 's', 'output': 's'}

    setCaption('m')

    setOutputs([option1, option2])
  };
  

return (
  <div className="App">
    <h1>Which option is better?</h1>
    <p>{caption}</p>
    <div>
      {outputs.map((option) => (
        <LLMOutput
          model={option.model}
          prompt={option.prompt}
          output={option.output}
          onSelect={handleOptionSelect}
        />
      ))}
    </div>
  </div>
);
}

export default App;
