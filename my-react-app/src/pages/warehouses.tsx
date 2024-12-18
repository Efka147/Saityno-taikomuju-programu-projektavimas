import * as React from "react";
import {
  Background,
  DeleteModal,
  EditWarehouse,
  NavigationBar,
} from "../components";
import { AuthContext } from "../contexts/authContext";
import { ErrorResponse, Roles, RouteNames, Warehouse } from "../types";
import { useIsMobile, useRoutePermissionEnsurer } from "../hooks";
import { APIBaseUrl } from "../constants";
import { useLocation, useNavigate } from "react-router-dom";

const Warehouses: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const [data, setData] = React.useState<Warehouse[]>();
  const [deleting, setDeleting] = React.useState<Warehouse>();
  const [editing, setEditing] = React.useState<Warehouse>();
  const [adding, setAdding] = React.useState(false);
  const navigate = useNavigate();
  useRoutePermissionEnsurer(authContext?.role);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { supplierId } = location.state || {};
  const fetchData = async () => {
    if (!authContext?.role) return;
    const response = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId ?? ""
      }/warehouse/${authContext?.relation?.warehouse ?? ""}`,
      {
        headers: {
          Authorization: authContext?.accessToken ?? "",
        },
      }
    );
    if (response.status === 200) {
      const json = await response.json();
      if (Array.isArray(json)) setData(json);
      else setData([json]);
    }
  };
  React.useEffect(() => {
    fetchData();
  }, [authContext?.role]);

  const deleteWarehouse = async (item: Warehouse) => {
    await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId
      }/warehouse/${item._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authContext?.accessToken ?? "",
        },
      }
    );
  };

  React.useEffect(() => {
    fetchData();
  }, [authContext?.role]);

  const onPressWatch = (item: Warehouse) => {
    navigate(`/${RouteNames.GOOD}`, {
      state: {
        supplierId: authContext?.relation?.supplier ?? supplierId,
        warehouseId: item._id,
      },
    });
  };

  const onPressEdit = async (
    item: Partial<Omit<Warehouse, "_id" | "supplier">>
  ): Promise<string | undefined> => {
    const resp = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId
      }/warehouse/${editing?._id}`,
      {
        //@ts-ignore
        body: JSON.stringify(item),
        method: "PUT",
        headers: {
          Authorization: authContext?.accessToken ?? "",
          "Content-Type": "application/json",
        },
      }
    );
    if (resp.status !== 201) {
      const err = (await resp.json()) as ErrorResponse;
      return err.details;
    }
    fetchData();
    setEditing(undefined);
    return;
  };
  const onPressDelete = (item: Warehouse) => {
    setDeleting(undefined);
    deleteWarehouse(item).then(fetchData);
  };

  const onPressAdd = async (
    item: Partial<Omit<Warehouse, "_id" | "supplier">>
  ): Promise<string | undefined> => {
    const resp = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId
      }/warehouse`,
      {
        body: JSON.stringify(item),
        method: "POST",
        headers: {
          Authorization: authContext?.accessToken ?? "",
          "Content-Type": "application/json",
        },
      }
    );
    if (resp.status !== 201) {
      const err = (await resp.json()) as ErrorResponse;
      return err.details;
    }
    fetchData();
    setAdding(false);
    return;
  };

  return (
    <div style={{ left: 0, top: 0, position: "absolute" }}>
      <Background />
      {deleting && (
        <DeleteModal
          onSubmit={() => onPressDelete(deleting)}
          onCancel={() => setDeleting(undefined)}
        />
      )}
      {editing && (
        <EditWarehouse
          warehouse={editing}
          onCancel={() => setEditing(undefined)}
          onSubmit={(modified) => onPressEdit(modified)}
        />
      )}
      {adding && (
        <EditWarehouse
          warehouse={{
            supplier: "",
            location: "",
            sizeSquareMeters: 0,
            _id: "",
          }}
          onCancel={() => setAdding(false)}
          onSubmit={(item) => onPressAdd(item)}
          isAdd
        />
      )}
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
        <NavigationBar />
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
                <p>{warehouse.sizeSquareMeters} m2</p>
              </div>
              {authContext?.role !== Roles.WAREHOUSE && (
                <div
                  style={{
                    alignContent: "center",
                    position: "relative",
                    alignSelf: "center",
                    justifyContent: "flex-end",
                    ...(isMobile
                      ? {
                          flexDirection: "column",
                          display: "flex",
                        }
                      : {
                          flex: 1,
                          flexDirection: "row",
                          display: "flex",
                        }),
                  }}
                >
                  <button
                    className="blue-button"
                    onClick={() => onPressWatch(warehouse)}
                  >
                    Peržiūrėti
                  </button>
                  <button
                    className="blue-button"
                    style={isMobile ? {} : { marginLeft: "20px" }}
                    onClick={() => setEditing(warehouse)}
                  >
                    Redaguoti
                  </button>
                  <button
                    style={
                      isMobile
                        ? {}
                        : { marginLeft: "20px", marginRight: "30px" }
                    }
                    className="red-button"
                    onClick={() => setDeleting(warehouse)}
                  >
                    Ištrinti
                  </button>
                </div>
              )}
            </div>
          ))}
          {authContext?.role !== Roles.WAREHOUSE && (
            <button
              style={{ marginBottom: "100px" }}
              className="green-button"
              onClick={() => {
                setAdding(true);
              }}
            >
              Pridėti sandelį
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Warehouses;
