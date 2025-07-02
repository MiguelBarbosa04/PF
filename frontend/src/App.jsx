import React, { useState } from 'react';
import RegisterForm from './components/RegisterForm.jsx';
import LoginForm from './components/LoginForm.jsx';
import { createUser } from './services/api.js';
import {BrowserRouter, Route, Routes} from "react-router";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";


function App () {
return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
      </Routes>
         </>
  );}


export default App
