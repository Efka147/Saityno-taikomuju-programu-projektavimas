import * as React from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";
import { Background } from "../components";
import { InitialRouteByRole } from "../App";

const LoginScreen: React.FC = () => {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const navigate = useNavigate();
  const authContext = React.useContext(AuthContext);
  const onSubmit = async () => {
    const role = await authContext?.login(username, password);
    if (role) {
      // if (role === Roles.ADMIN) navigate(`/${RouteNames.ADMIN}`);
      navigate(`/${InitialRouteByRole[role]}`);
    } else setShowError(true);
  };

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
        {showError && (
          <div
            style={{
              backgroundColor: "red",
              borderRadius: 15,
              borderColor: "white",
              borderWidth: 2,
              borderStyle: "solid",
              marginBottom: 30,
              position: "relative",
            }}
          >
            <p style={{ padding: 20, color: "white", fontWeight: "bold" }}>
              Neteisingi prisijungimo duomenys
            </p>
            <button
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                background: "transparent",
                borderWidth: 0,
                color: "white",
                fontSize: 15,
                cursor: "pointer",
              }}
              onClick={() => setShowError(false)}
            >
              X
            </button>
          </div>
        )}
        <div
          style={{
            flexDirection: "column",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <label
            style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
          >
            Vartotojo vardas
          </label>
          <input
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginTop: "8px",
            }}
            onChange={(v) => setUsername(v.target.value)}
          />
          <br />
          <label
            style={{ color: "white", fontSize: "18px", fontWeight: "bold" }}
          >
            Slaptažodis
          </label>
          <input
            type={"password"}
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginTop: "8px",
            }}
            onChange={(v) => setPassword(v.target.value)}
          />
          <br />
          <br />
          <button className="blue-button" onClick={onSubmit}>
            Prisijungti
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
