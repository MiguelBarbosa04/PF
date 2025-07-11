import React from 'react';
import {Route, Routes} from "react-router";
import Home from "./pages/Home.jsx";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import Welcome from "./pages/Welcome.jsx";
import EscolherTema from "./pages/EscolherTema.jsx";
import Upload from "./pages/Upload.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Perfil from "./pages/Perfil.jsx";
import EditarTema from "./pages/EditarTema.jsx";
import Chat from "./pages/Chat.jsx"

function App () {
return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
          <Route path='/register' element={<Register/>} />
          <Route path='/login' element={<Login />} />
          <Route path='/welcome' element={<PrivateRoute><Welcome /></PrivateRoute>} />
          <Route path='/tema' element={<PrivateRoute><EscolherTema /></PrivateRoute>} />
          <Route path='/upload' element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path='/perfil' element={<PrivateRoute><Perfil /></PrivateRoute>} />
          <Route path='/editar_tema' element={<PrivateRoute><EditarTema /></PrivateRoute>} />
              <Route path='/chat' element={<PrivateRoute><Chat/></PrivateRoute>} />
      </Routes>
         </>
  );}


export default App
