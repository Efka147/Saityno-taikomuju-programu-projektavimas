import * as React from "react";
import Background from "../components/background";
import { TopNavigation } from "../components";
import { Roles, Supplier } from "../types";
import { APIBaseUrl } from "../constants";
import { AuthContext } from "../contexts/authContext";
import { Star } from "../assets";
import "../index.css";
import { useRoutePermissionEnsurer } from "../hooks";
const AdminPanel: React.FC = () => {
  const [data, setData] = React.useState<Supplier[]>();
  const authContext = React.useContext(AuthContext);
  useRoutePermissionEnsurer(authContext?.role);
  React.useEffect(() => {
    (async () => {
      if (!authContext?.role) return;
      const response = await fetch(
        `${APIBaseUrl}/supplier/${authContext.relation?.supplier ?? ""}`,
        {
          headers: {
            Authorization: authContext?.accessToken ?? "",
          },
        }
      );
      if (response.status === 200) {
        const json = await response.json();
        setData(Array.isArray(json) ? json : [json]);
      }
    })();
  }, [authContext?.role]);

  return (
    <div style={{ left: 0, top: 0, position: "absolute" }}>
      <Background />
      <div
        style={{
          overflow: "scroll",
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
        }}
        className="no-scrollbar"
      >
        <TopNavigation />
        <div
          style={{
            flex: 1,
            overflowY: "scroll",
            zIndex: 1,
            justifyItems: "center",
          }}
        >
          {data?.map((supplier, index) => (
            <div
              style={{
                height: "200px",
                width: "95%",
                backgroundColor: "white",
                borderRadius: "15px",
                marginBottom: "40px",
                marginTop: index === 0 ? "40px" : undefined,
                flexDirection: "row",
                display: "flex",
                alignItems: "space-between",
              }}
            >
              <div
                style={{
                  marginLeft: "15px",
                  marginTop: "15px",
                  marginRight: "15px",
                  // paddingTop: "15px",
                  flexDirection: "column",
                }}
              >
                <p style={{ fontSize: 18, fontWeight: "bold" }}>
                  {supplier.name}
                </p>
                <p>{supplier.description}</p>
                <div style={{ flexDirection: "row", display: "flex" }}>
                  <p
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {supplier.rating}
                  </p>
                  <img
                    src={Star}
                    style={{
                      resize: "both",
                      width: "30px",
                      height: "30px",
                      paddingTop: "1.2em",
                    }}
                  />
                </div>
              </div>
              {authContext?.role === Roles.ADMIN && (
                <div
                  style={{
                    flex: 1,
                    alignContent: "center",
                    position: "relative",
                    alignSelf: "center",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                  }}
                >
                  <button className="blue-button">Redaguoti</button>
                  <button
                    style={{ marginLeft: "20px", marginRight: "30px" }}
                    className="red-button"
                  >
                    Ištrinti
                  </button>
                </div>
              )}
            </div>
          ))}
          {authContext?.role === Roles.ADMIN && (
            <button style={{ marginBottom: "100px" }} className="green-button">
              Pridėti tiekėją
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
