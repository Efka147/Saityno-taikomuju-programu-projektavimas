import * as React from "react";

type DeleteModalType = {
  onSubmit: () => void;
  onCancel: () => void;
};

const DeleteModal: React.FC<DeleteModalType> = ({ onSubmit, onCancel }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    setIsVisible(true);
  }, []);

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
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "30px",
          }}
        >
          <div>
            <p style={{ fontSize: 18, textAlign: "center" }}>
              Ar tikrai norite ištrinti?
            </p>
            <p
              style={{ fontSize: 18, fontWeight: "bold", textAlign: "center" }}
            >
              Šis veiksmas yra negrįžtamas
            </p>
          </div>
          <div>
            <button className="red-button" onClick={onSubmit}>
              Ištrinti
            </button>
            <button
              className="green-button"
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

export default DeleteModal;
