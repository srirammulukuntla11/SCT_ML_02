import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UploadData from './components/UploadData';
import ClusteringResults from './components/ClusteringResults';
import './styles/App.css';

function App() {
  const [currentData, setCurrentData] = useState(null);
  const [clusteringResults, setClusteringResults] = useState(null);

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🛍️ Customer Segmentation
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">Upload Data</Link>
              </li>
              {clusteringResults && (
                <li className="nav-item">
                  <Link to="/results" className="nav-link">Results</Link>
                </li>
              )}
            </ul>
          </div>
        </nav>

        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={
                <UploadData 
                  setCurrentData={setCurrentData}
                  setClusteringResults={setClusteringResults}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <ClusteringResults 
                  results={clusteringResults}
                  currentData={currentData}
                />
              } 
            />
          </Routes>
        </div>
        
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;