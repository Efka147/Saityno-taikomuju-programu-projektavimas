import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginScreen, LandingScreen, AdminPanel, Warehouses } from "./pages";
import { Roles } from "./contexts/authContext";
import { RouteNames } from "./types";

export const InitialRouteByRole: { [key in Roles]: RouteNames } = {
  [Roles.ADMIN]: RouteNames.ADMIN,
  [Roles.SUPPLIER]: RouteNames.WAREHOUSES,
  [Roles.WAREHOUSE]: RouteNames.LANDING,
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={RouteNames.LANDING} element={<LandingScreen />} />
        <Route path={RouteNames.LOGIN} element={<LoginScreen />} />
        <Route path={RouteNames.ADMIN} element={<AdminPanel />} />
        <Route path={RouteNames.WAREHOUSES} element={<Warehouses />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
