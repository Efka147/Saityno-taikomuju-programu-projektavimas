import * as React from "react";
import Background from "../../components/background";

const LoginScreen: React.FC = () => {
  return (
    <div style={{ width: "100vw", display: "grid" }}>
      <Background />
      <h1
        style={{
          color: "white",
          zIndex: 1,
          position: "fixed",
          justifySelf: "center",
          placeSelf: "center",
          alignSelf: "center",
          top: "5vh",
        }}
      >
        Prisijungimo forma
      </h1>
      <div
        style={{
          position: "fixed",
          zIndex: 1,
          justifyItems: "center",
          alignContent: "center",
          width: "100vw",
          height: "90vh",
        }}
      >
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h2 style={{ color: "white" }}>Vartotojo vardas</h2>
          <input />
          <h2 style={{ color: "white" }}>Slaptažodis</h2>
          <input />
          <br />
          <br />
          <button className="basic-button">Prisijungti</button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
