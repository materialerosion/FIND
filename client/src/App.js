// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MsalAuthenticationTemplate, UnauthenticatedTemplate, AuthenticatedTemplate } from '@azure/msal-react';
import Navbar from './components/Navbar';
import FormulaList from './pages/FormulaList';
import FormulaDetail from './pages/FormulaDetail';
import SearchPage from './pages/SearchPage';
import DatabaseManagement from './pages/DatabaseManagement';
import AliasManagement from './pages/AliasManagement';
import './styles/App.scss';

// Loading component for the authentication template
const Loading = () => {
  return <div className="loading">Authentication in progress...</div>;
};

// Error component for the authentication template
const ErrorComponent = ({error}) => {
  return <div className="error">Authentication failed: {error.errorMessage}</div>;
};

// Welcome component for unauthenticated users
const Welcome = () => {
  return (
    <div className="welcome-container">
      <h2>Welcome to FIND</h2>
      <p>Formula Ingredient Navigator & Database</p>
      <div className="welcome-message">
        <p>Please sign in to access the application.</p>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <div className="container">
            <UnauthenticatedTemplate>
              <Welcome />
            </UnauthenticatedTemplate>
            
            <AuthenticatedTemplate>
              <Routes>
                <Route path="/" element={<FormulaList />} />
                <Route path="/formula/:objectNumber" element={<FormulaDetail />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/database" element={<DatabaseManagement />} />
                <Route path="/aliases" element={<AliasManagement />} />
              </Routes>
            </AuthenticatedTemplate>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;