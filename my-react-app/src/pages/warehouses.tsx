import * as React from "react";
import { Background, TopNavigation } from "../components";
import { AuthContext } from "../contexts/authContext";
import { Warehouse } from "../types";
import { useRoutePermissionEnsurer } from "../hooks";
import { APIBaseUrl } from "../constants";

const Warehouses: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const [data, setData] = React.useState<Warehouse[]>();
  useRoutePermissionEnsurer(authContext?.role);
  React.useEffect(() => {
    (async () => {
      if (!authContext?.role) return;
      const response = await fetch(
        `${APIBaseUrl}/supplier/${
          authContext?.relation?.supplier ?? ""
        }/warehouse/${authContext?.relation?.warehouse ?? ""}`,
        {
          headers: {
            Authorization: authContext?.accessToken ?? "",
          },
        }
      );
      if (response.status === 200) {
        setData(await response.json());
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
          {data?.map((warehouse, index) => (
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
                  {warehouse.location}
                </p>
                <p>{warehouse.sizeSquareMeters}</p>
              </div>
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
            </div>
          ))}
          <button style={{ marginBottom: "100px" }} className="green-button">
            Pridėti sandelį
          </button>
        </div>
      </div>
    </div>
  );
};

export default Warehouses;
