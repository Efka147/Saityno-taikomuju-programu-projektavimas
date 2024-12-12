import * as React from "react";
import { Good } from "../types";

type EditGoodType = {
  good: Good;
  onCancel: () => void;
  onSubmit: (
    good: Omit<Good, "_id" | "warehouse">
  ) => Promise<string | undefined>;
  isAdd?: boolean;
};

const EditGood: React.FC<EditGoodType> = ({
  good,
  onSubmit,
  onCancel,
  isAdd = false,
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [err, setErr] = React.useState<string>();
  const [name, setName] = React.useState<string>(good.name);
  const [description, setDescription] = React.useState(good.description);

  const validate = () => {
    return name.trim() && description.trim();
  };

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const onEdit = async () => {
    if (!validate()) {
      setErr("Netinkamos reikšmės");
      return;
    }
    const err = await onSubmit({ name, description });
    if (err) setErr(err);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.2)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.5s ease-in-out",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "30px",
          overflowY: "scroll",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div
          style={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            margin: "20px",
          }}
        >
          <label
            style={{
              color: "black",
              fontSize: "18px",
              fontWeight: "bold",
              marginTop: 20,
            }}
          >
            Pavadinimas
          </label>
          <input
            type={"name"}
            required={true}
            style={{
              position: "relative",
              width: "80%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginTop: "8px",
              maxLines: 1,
              marginBottom: 20,
            }}
            value={name}
            onChange={(v) => setName(v.target.value)}
          />

          <label
            style={{ color: "black", fontSize: "18px", fontWeight: "bold" }}
          >
            Aprašymas
          </label>
          <input
            type={"name"}
            required={true}
            style={{
              position: "relative",
              width: "80%",
              padding: "10px",
              fontSize: "16px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginTop: "8px",
              maxLines: 1,
              marginBottom: 20,
            }}
            value={description}
            onChange={(v) => setDescription(v.target.value)}
          />

          {!!err && (
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
                {err}
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
                onClick={() => setErr(undefined)}
              >
                X
              </button>
            </div>
          )}
          <div style={{ marginBottom: 20 }}>
            <button className="green-button" onClick={onEdit}>
              {isAdd ? "Pridėti" : "Redaguoti"}
            </button>
            <button
              className="red-button"
              onClick={onCancel}
              style={{ marginLeft: "20px" }}
            >
              Atšaukti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGood;
