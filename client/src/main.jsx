import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import './App.css'
import Home from './pages/Home.jsx';
import Upload from './pages/Upload.jsx';
import Navbar from './components/Navbar.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
        <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
          {/* Add your routes here as needed:
          <Route path="upload" element={<FileUpload />} />
          <Route path="preview/:id" element={<FilePreview />} />
          etc... */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
