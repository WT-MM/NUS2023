import React, { useEffect } from 'react';

const PlotContainer = () => {
    const dir = 'plots';

    const fileNames = ["bootstrap.html", 'numMatches.html', 'winRate.html', 'straightElo.html', 'proportionalWin.html']


  return (
    <div class="plotContainer">
      {fileNames.map((fileName, index) => (
        <div class="plot" key={index}>
          <div class="plotTitle">{fileName.split(".")[0]}</div>
          <iframe height="500px" width="500px" src={`/plots/${fileName}`} title={fileName.split(".")[0]} />
        </div>
      ))}
    </div>
  );
};

export default PlotContainer;