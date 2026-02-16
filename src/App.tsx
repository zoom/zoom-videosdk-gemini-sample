import StartPage from "./components/Startpage";
import CustomUIPage from './components/CustomUIpage';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/startpage" />} />
        <Route path="/startpage" element={<StartPage />} />
        <Route path="/customuipage" element={<CustomUIPage />} />
      </Routes>
    </Router>
  )
}

export default App
