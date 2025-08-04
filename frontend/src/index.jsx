import { createRoot } from 'react-dom/client'
import {BrowserRouter} from "react-router";
import App from "./App.jsx";
import React from 'react'
import {LanguageProvider} from "./locales/LanguageContext.jsx";


const root = createRoot(document.getElementById('root'))

root.render(
    <React.StrictMode>
        <BrowserRouter>
            <LanguageProvider>
                  <App/>
            </LanguageProvider>
        </BrowserRouter>
    </React.StrictMode>

);
