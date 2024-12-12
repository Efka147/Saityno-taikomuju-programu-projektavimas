import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { LoginScreen, LandingScreen, AdminPanel, Warehouses } from "./pages";
import { Roles } from "./contexts/authContext";
import { RouteNames } from "./types";
import Goods from "./pages/good";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./App.css";

export const InitialRouteByRole: { [key in Roles]: RouteNames } = {
  [Roles.ADMIN]: RouteNames.ADMIN,
  [Roles.SUPPLIER]: RouteNames.WAREHOUSES,
  [Roles.WAREHOUSE]: RouteNames.GOOD,
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition key={location.key} classNames="fade" timeout={300}>
        <Routes location={location}>
          <Route path={RouteNames.LANDING} element={<LandingScreen />} />
          <Route path={RouteNames.LOGIN} element={<LoginScreen />} />
          <Route path={RouteNames.ADMIN} element={<AdminPanel />} />
          <Route path={RouteNames.WAREHOUSES} element={<Warehouses />} />
          <Route path={RouteNames.GOOD} element={<Goods />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
