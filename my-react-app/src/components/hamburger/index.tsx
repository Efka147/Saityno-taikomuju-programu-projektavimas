import * as React from "react";
import {
  Controls,
  Good,
  Hamburger,
  Logout,
  Supplier,
  Warehouse,
} from "../../assets";
import { Roles, RouteNames } from "../../types";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";

type ButtonType = {
  name: string;
  onPress: () => void;
  icon: any;
};

const HamburgerMenu: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);

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

  const toggleMenu = () => {
    setExpanded((prevState) => !prevState);
  };

  const styles = {
    menuContainer: {
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      width: "50px",
      backgroundColor: expanded ? "#333" : "#00000000",
      transition: "width 0.3s ease-in-out, background-color 0.3s ease-in-out",
      zIndex: 1000,
    },
    expandedMenu: {
      width: "200px",
    },
    hamburger: {
      width: "30px",
      height: "30px",
      filter: "invert(1) brightness(2) contrast(100%)",
    },
    menuContent: {
      display: "none",
      color: "#fff",
      padding: "20px",
    },
    menuExpanded: {
      display: "block",
    },
    menuItem: {
      display: "flex",
      flexDirection: "row",
      padding: "10px 0",
      cursor: "pointer",
      justifyContent: "space-between",
    },
    image: {
      width: "30px",
      heigth: "30px",
      filter: "invert(1) brightness(2) contrast(100%)",
    },
  };

  return (
    <div
      //@ts-ignore
      style={{
        ...styles.menuContainer,
        ...(expanded ? styles.expandedMenu : {}),
      }}
    >
      <img src={Hamburger} style={styles.hamburger} onClick={toggleMenu} />
      <div
        style={{
          ...styles.menuContent,
          ...(expanded ? styles.menuExpanded : {}),
        }}
      >
        {buttons.map((button) => (
          //@ts-ignore
          <div style={styles.menuItem} onClick={button.onPress}>
            <p>{button.name}</p>
            <img src={button.icon} style={styles.image} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HamburgerMenu;
