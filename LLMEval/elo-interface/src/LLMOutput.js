import { useState, useEffect } from "react";


const LLMOutput = ({ model, other, prompt, output, onSelect}) => {
    const [fontSize, setFontSize] = useState(20)
    const [fontWeight, setFontWeight] = useState(400)

    useEffect(() => {
      console.log(output.length)

      if (output.length < 100 ) setFontWeight(200)
      else if (output.length < 200) setFontWeight(300)

      if (output.length > 600) setFontSize('1rem')
      else if (output.length > 500) setFontSize('1.2rem')
      else if (output.length > 250) setFontSize('1.5rem')
      else if (output.length > 100) setFontSize('1.8rem')
      else if (output.length > 50) setFontSize('2rem')
      else if (output.length > 25) setFontSize('3rem')
    }, [output])

    const handleOptionSelect = () => {
      onSelect(model, other, prompt);
    };
  
    return (<div class="mM">
      <div class="textOutput" style={{fontSize:fontSize, fontWeight:fontWeight}} onClick={handleOptionSelect}>{output}</div>
      </div>
    );
  };

export default LLMOutput;