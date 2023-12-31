import React, { useEffect, useState } from 'react';
import './App.css';
import { app } from './firebase';
import { doc, collection, getFirestore, setDoc, addDoc, serverTimestamp, getDoc, getDocs, query} from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import LLMOutput from './LLMOutput'
import Google from './images/google.png'


const Main = () => {
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
  
    const handleOptionSelect = async (winner, loser, prompt) => {

      await addDoc(collection(db, 'test'), {
        'winner': winner,
        'loser': loser,
        'prompt': prompt,
        'timestamp': serverTimestamp(),
        'session': sessionId
    });
  
      getOptions()
  
    };
  
    var randomEntry = function (obj) {
      var keys = Object.keys(obj);
      return obj[keys[ keys.length * Math.random() << 0]];
  };
  
    const generateSessionId = () => {
      const sessionId = uuidv4().replace(/\\/g, '');
      return sessionId;
    };
  
    const cleanupSessionData = (sessionId) => {
      //Do something i guess
    };

    const loadSearch = () => {
      window.open("https://www.google.com/search?q=" + caption, "_blank")
    }
  
    const getOptions = async () => {
  
      const collectionRef = collection(db, 'data')
      const querySnapshot = await getDocs(query(collectionRef))
  
      const randomPrompt = randomEntry(querySnapshot.docs)
      const randData = randomPrompt.data()
      let randOne = Math.floor(Math.random() * randData['response'].length);
      let randTwo = Math.floor(Math.random() * randData['response'].length);

      
      while (randData['model'][randOne] === randData['model'][randTwo]){
        randTwo = Math.floor(Math.random() * randData['response'].length);
      }
  
      //const docData = await getDoc(doc(db, 'data','mm'))
      //const data = docData.data();
      const option1 = {'model': randData['model'][randOne], 'other': randData['model'][randTwo],'prompt': randomPrompt.id, 'output': randData['response'][randOne]}
      const option2 = {'model': randData['model'][randTwo], 'other': randData['model'][randOne], 'prompt': randomPrompt.id, 'output': randData['response'][randTwo]}
  
      setCaption(randomPrompt.id)
  
      setOutputs([option1, option2])
    };
    
    //<img width="15px" height="auto" src={Google} alt="Google" class="googleImg" />
  
    return (
        <div className="App" style={{ padding: '1rem' }}>
          <div class="bigtext">Which response is better?</div>
          <div class="promptContainer">
            <div class="bigishtext">{caption}</div>
            <div class="googleContainer" onClick={loadSearch}>
              <a class="googleText"><a style={{fontSize:"1.5em",fontWeight:"620",background:"-webkit-linear-gradient(#e79e9e, #6a6adc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", color:"rgb(121, 101, 223)"}}>G</a>oogle it</a>
            </div>
          </div>
          <div class="stuffContainer">
            {outputs.map((option) => (
              <LLMOutput
                model={option.model}
                other={option.other}
                prompt={option.prompt}
                output={option.output}
                onSelect={handleOptionSelect}
              />
            ))}
          </div>
        </div>
    );
}

export default Main