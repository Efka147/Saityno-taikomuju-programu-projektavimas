import * as React from "react";
import { Background, DeleteModal, NavigationBar } from "../components";
import { AuthContext } from "../contexts/authContext";
import { ErrorResponse, Good } from "../types";
import { useRoutePermissionEnsurer } from "../hooks";
import { APIBaseUrl } from "../constants";
import { useLocation } from "react-router-dom";
import EditGood from "../components/editGood";

const Goods: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const [data, setData] = React.useState<Good[]>();
  useRoutePermissionEnsurer(authContext?.role);
  const location = useLocation();
  const [deleting, setDeleting] = React.useState<Good>();
  const [editing, setEditing] = React.useState<Good>();
  const [adding, setAdding] = React.useState(false);
  const { supplierId, warehouseId } = location.state || {};
  const fetchData = async () => {
    if (!authContext?.role) return;
    const response = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId ?? ""
      }/warehouse/${
        authContext?.relation?.warehouse ?? warehouseId ?? ""
      }/good`,
      {
        headers: {
          Authorization: authContext?.accessToken ?? "",
        },
      }
    );
    if (response.status === 200) {
      setData(await response.json());
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [authContext?.role]);

  const deleteWarehouse = async (item: Good) => {
    await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId ?? ""
      }/warehouse/${authContext?.relation?.warehouse ?? warehouseId}/good/${
        item._id
      }`,
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

  const onPressEdit = async (
    item: Omit<Good, "_id" | "warehouse">
  ): Promise<string | undefined> => {
    const resp = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId
      }/warehouse/${authContext?.relation?.warehouse ?? warehouseId}/good/${
        editing?._id
      }`,
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
  const onPressDelete = (item: Good) => {
    setDeleting(undefined);
    deleteWarehouse(item).then(fetchData);
  };

  const onPressAdd = async (
    item: Omit<Good, "_id" | "warehouse">
  ): Promise<string | undefined> => {
    const resp = await fetch(
      `${APIBaseUrl}/supplier/${
        authContext?.relation?.supplier ?? supplierId
      }/warehouse/${authContext?.relation?.warehouse ?? warehouseId}/good`,
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
        <EditGood
          good={editing}
          onCancel={() => setEditing(undefined)}
          onSubmit={(modified) => onPressEdit(modified)}
        />
      )}
      {adding && (
        <EditGood
          good={{
            _id: "",
            name: "",
            description: "",
            warehouse: "",
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
          {data?.map((good, index) => (
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
                <p style={{ fontSize: 18, fontWeight: "bold" }}>{good.name}</p>
                <p>{good.description}</p>
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
                <button
                  className="blue-button"
                  onClick={() => setEditing(good)}
                >
                  Redaguoti
                </button>
                <button
                  style={{ marginLeft: "20px", marginRight: "30px" }}
                  className="red-button"
                  onClick={() => setDeleting(good)}
                >
                  Ištrinti
                </button>
              </div>
            </div>
          ))}
          <button
            style={{ marginBottom: "100px" }}
            className="green-button"
            onClick={() => setAdding(true)}
          >
            Pridėti prekę
          </button>
        </div>
      </div>
    </div>
  );
};

export default Goods;
