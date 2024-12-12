import * as React from "react";
import { AuthContext } from "../../contexts/authContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Controls, Good, Logout, Supplier, Warehouse } from "../../assets";
import "./topNav.css";
import { Roles, RouteNames } from "../../types";

type ButtonType = {
  name: string;
  onPress: () => void;
  icon: any;
};

const TopNavigation: React.FC = () => {
  const authContext = React.useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const RoleButtons: { [key in Roles]: ButtonType[] } = {
    [Roles.ADMIN]: [
      {
        name: "Administratoriaus pultas",
        onPress: () => {
          if (location.pathname.substring(1) !== RouteNames.ADMIN) {
            navigate(`/${RouteNames.ADMIN}`);
          }
        },
        icon: Controls,
      },
    ],
    [Roles.SUPPLIER]: [
      {
        name: "Mano informacija",
        onPress: () => {
          if (location.pathname.substring(1) !== RouteNames.ADMIN) {
            navigate(`/${RouteNames.ADMIN}`);
          }
        },
        icon: Supplier,
      },
      {
        name: "Sandėliai",
        onPress: () => {
          if (location.pathname.substring(1) !== RouteNames.WAREHOUSES) {
            navigate(`/${RouteNames.WAREHOUSES}`);
          }
        },
        icon: Warehouse,
      },
    ],
    [Roles.WAREHOUSE]: [
      {
        name: "Mano sandelis",
        onPress: () => {
          if (location.pathname.substring(1) !== RouteNames.WAREHOUSES) {
            navigate(`/${RouteNames.WAREHOUSES}`);
          }
        },
        icon: Warehouse,
      },
      {
        name: "Prekės",
        onPress: () => {
          if (location.pathname.substring(1) !== RouteNames.GOOD) {
            navigate(`/${RouteNames.GOOD}`);
          }
        },
        icon: Good,
      },
    ],
  };

  const buttons: ButtonType[] = [
    ...(authContext?.role ? RoleButtons[authContext.role] : []),
    {
      name: "Atsijungti",
      onPress: () => {
        authContext?.logout();
        navigate("/");
      },
      icon: Logout,
    },
  ];

  return (
    <div className="navbar">
      {buttons.map((button) => (
        <button onClick={button.onPress}>
          <img src={button.icon} />
          <p style={{ marginLeft: 10, color: "white" }}>{button.name}</p>
        </button>
      ))}
    </div>
  );
};
export default TopNavigation;
