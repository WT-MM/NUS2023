import React from 'react';
import './App.css';
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import Main from './mainPage';
import Layout from './layout';
import StatsPage from './statsPage';
import LiveStats from './liveStats';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="mmm" element={<LiveStats />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
