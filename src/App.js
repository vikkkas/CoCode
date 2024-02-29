import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import EditorPage from "./pages/EditorPage";
import {Toaster} from 'react-hot-toast';

function App() {
  return (
    <>

    <div>
        <Toaster position="top-right" 
        toastOptions={{
            success:{theme:{
                primary:'#49f0e2'
                },
                },
                }}>
            
        </Toaster>
    </div>

    
    {/* Session id routing with help of router. */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}>
            {" "}
          </Route>{" "}
          <Route path="/editor/:sessionId" element={<EditorPage />}>
            {" "}
          </Route>{" "}
        </Routes>{" "}
      </BrowserRouter>{" "}
    </>
  );
}

export default App;
