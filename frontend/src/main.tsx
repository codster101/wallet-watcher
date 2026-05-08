import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Rules from './Rules.tsx';

// const root = document.getElementById("root");
// ReactDOM.createRoot(root!).render(
//   <BrowserRouter>
//     <Routes>
//       // <Route index element={<App />} />
//       // <Route path='rules' element={<Rules />} />
//     </Routes>
//   </BrowserRouter>,
// );

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path='rules' element={<Rules />} />
      </Routes>
    </BrowserRouter>,
  </StrictMode>,
)
