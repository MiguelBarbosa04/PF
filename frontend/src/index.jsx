import { createRoot } from 'react-dom/client'
import './index.css'
import {BrowserRouter} from "react-router";
import App from "./App.jsx";
import React from 'react'


const root = createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <BrowserRouter>
                  <App/>
        </BrowserRouter>
    </React.StrictMode>

);
