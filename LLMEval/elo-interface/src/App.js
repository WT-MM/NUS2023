import React, { useState } from 'react';
import './App.css';
import firebase from 'firebase/app';
import { getDatabase, ref, set } from "firebase/database";


function App() {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  
    // Push data to the Firebase Realtime Database
    const db = getDatabase();
    set(ref(db, 'comparisons'), {
      option: option,
    });
  };
  

  return (
    <div className="App">
      <h1>Select the better option:</h1>
      <div className="options">
        <button className={`option ${selectedOption === 'option1' ? 'selected' : ''}`} onClick={() => handleOptionSelect('option1')}>
          Option 1
        </button>
        <button className={`option ${selectedOption === 'option2' ? 'selected' : ''}`} onClick={() => handleOptionSelect('option2')}>
          Option 2
        </button>
      </div>
      {selectedOption && <h2>You selected: {selectedOption}</h2>}
    </div>
  );
}

export default App;
