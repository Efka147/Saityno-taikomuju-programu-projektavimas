import { useLocation, useNavigate } from "react-router-dom";
import { InitialRouteByRole } from "../App";
import { useEffect } from "react";
import { Roles, RouteNames } from "../types";

const useRoutePermissionEnsurer = (role: Roles | undefined | null) => {
  const routesByRole: { [key in Roles]: RouteNames[] } = {
    [Roles.ADMIN]: [RouteNames.ADMIN, RouteNames.WAREHOUSES],
    [Roles.SUPPLIER]: [RouteNames.ADMIN, RouteNames.WAREHOUSES],
    [Roles.WAREHOUSE]: [RouteNames.WAREHOUSES],
  };

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (role === undefined) {
      return;
    }
    if (role === null) {
      navigate(RouteNames.LANDING);
      return;
    }
    const path = location.pathname.substring(1);
    if (!routesByRole[role].includes(path as RouteNames)) {
      navigate(`/${InitialRouteByRole[role]}`, { replace: true });
    }
  }, [role]);
};

export default useRoutePermissionEnsurer;
