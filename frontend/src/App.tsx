import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import routes from './routes';

export const App = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
};

export default App; 