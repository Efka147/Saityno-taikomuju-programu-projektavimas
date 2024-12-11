import * as React from "react";
import "../index.css";
import { useNavigate } from "react-router-dom";
import { Background } from "../components";
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
        <button className="blue-button" onClick={() => navigate("/login")}>
          Prisijungti
        </button>
      </div>
    </div>
  );
};

export default LandingScreen;
