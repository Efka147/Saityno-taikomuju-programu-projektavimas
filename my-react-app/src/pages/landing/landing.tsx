import * as React from "react";
import "./landing.css";
import Background from "../../components/background";
import { useNavigate } from "react-router-dom";
const LandingScreen: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        position: "fixed",
      }}
    >
      <Background />
      <div
        style={{
          zIndex: 1,
          position: "fixed",
          height: "100vh",
          width: "100vw",
          justifyItems: "center",
          alignContent: "center",
        }}
      >
        <h2 style={{ color: "white" }}>Produktų valdymas</h2>
        <button className="basic-button" onClick={() => navigate("/login")}>
          Prisijungti
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;
