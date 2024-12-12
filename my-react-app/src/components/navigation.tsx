import * as React from "react";
import TopNavigation from "./topNav/topNav";
import HamburgerMenu from "./hamburger";
const NavigationBar: React.FC = () => {
  const isMobile = window.innerWidth <= 768;
  return isMobile ? <HamburgerMenu /> : <TopNavigation />;
};

export default NavigationBar;
