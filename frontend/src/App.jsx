import React from 'react';
import {Route, Routes} from "react-router";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import EscolherTema from "./pages/EscolherTema.jsx";
import Upload from "./pages/upload.jsx";


function App () {
return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/tema' element={<EscolherTema />} />
          <Route path='/upload' element={<Upload />} />
      </Routes>
         </>
  );}


export default App
