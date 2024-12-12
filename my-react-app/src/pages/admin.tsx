import * as React from "react";
import Background from "../components/background";
import { DeleteModal, EditSupplier, NavigationBar } from "../components";
import { ErrorResponse, Roles, RouteNames, Supplier } from "../types";
import { APIBaseUrl } from "../constants";
import { AuthContext } from "../contexts/authContext";
import { Star } from "../assets";
import "../index.css";
import { useIsMobile, useRoutePermissionEnsurer } from "../hooks";
import { useNavigate } from "react-router-dom";
const AdminPanel: React.FC = () => {
  const [data, setData] = React.useState<Supplier[]>();
  const [deleting, setDeleting] = React.useState<Supplier>();
  const [editing, setEditing] = React.useState<Supplier>();
  const [adding, setAdding] = React.useState(false);
  const authContext = React.useContext(AuthContext);
  const isMobile = useIsMobile();
  console.log(isMobile);
  const navigate = useNavigate();
  useRoutePermissionEnsurer(authContext?.role);

  const fetchData = async () => {
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
  };

  const deleteSupplier = async (item: Supplier) => {
    await fetch(`${APIBaseUrl}/supplier/${item._id}`, {
      method: "DELETE",
      headers: {
        Authorization: authContext?.accessToken ?? "",
      },
    });
  };

  React.useEffect(() => {
    fetchData();
  }, [authContext?.role]);

  const onPressWatch = (item: Supplier) => {
    navigate(`/${RouteNames.WAREHOUSES}`, { state: { supplierId: item._id } });
  };

  const onPressEdit = async (
    item: Omit<Supplier, "_id">
  ): Promise<string | undefined> => {
    const resp = await fetch(`${APIBaseUrl}/supplier/${editing?._id}`, {
      //@ts-ignore
      body: JSON.stringify(item),
      method: "PUT",
      headers: {
        Authorization: authContext?.accessToken ?? "",
        "Content-Type": "application/json",
      },
    });
    if (resp.status !== 201) {
      const err = (await resp.json()) as ErrorResponse;
      return err.details;
    }
    fetchData();
    setEditing(undefined);
    return;
  };
  const onPressDelete = (item: Supplier) => {
    setDeleting(undefined);
    deleteSupplier(item).then(fetchData);
  };

  const onPressAdd = async (
    item: Omit<Supplier, "_id">
  ): Promise<string | undefined> => {
    const resp = await fetch(`${APIBaseUrl}/supplier`, {
      body: JSON.stringify(item),
      method: "POST",
      headers: {
        Authorization: authContext?.accessToken ?? "",
        "Content-Type": "application/json",
      },
    });
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
        <EditSupplier
          supplier={editing}
          onCancel={() => setEditing(undefined)}
          onSubmit={(modified) => onPressEdit(modified)}
        />
      )}
      {adding && (
        <EditSupplier
          supplier={{ name: "", rating: 0, description: "", _id: "" }}
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
                    onClick={() => onPressWatch(supplier)}
                  >
                    Peržiūrėti
                  </button>
                  <button
                    className="blue-button"
                    style={isMobile ? {} : { marginLeft: "20px" }}
                    onClick={() => setEditing(supplier)}
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
                    onClick={() => setDeleting(supplier)}
                  >
                    Ištrinti
                  </button>
                </div>
              )}
            </div>
          ))}
          {authContext?.role === Roles.ADMIN && (
            <button
              style={{ marginBottom: "100px" }}
              className="green-button"
              onClick={() => setAdding(true)}
            >
              Pridėti tiekėją
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
