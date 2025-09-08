import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import ConfigEditor from './pages/ConfigEditor';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/config/:environment" element={<ConfigEditor />} />
        </Routes>
      </Container>
    </div>
  );
}

export default App;
