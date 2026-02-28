import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import HomePage from './pages/HomePage.jsx';

function App() {


  return (
    <Container>
      <Routes>
        <Route 
          path="/"
          element={<HomePage />}
        />
      </Routes>
    </Container>
  )
}

export default App
