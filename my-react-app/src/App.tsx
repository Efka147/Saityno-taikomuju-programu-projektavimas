import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginScreen from "./pages/login/login";
import LandingScreen from "./pages/landing/landing";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingScreen />} />
        <Route path="login" element={<LoginScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
