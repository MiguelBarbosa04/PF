import React from 'react';
import {Route, Routes} from "react-router";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Welcome from "./pages/Welcome.jsx";
import Perfil from "./pages/Perfil.jsx";

function App () {
return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/welcome' element={<Welcome />} />
          <Route path='/perfil' element={<Perfil />} />
      </Routes>
         </>
  );}


export default App
