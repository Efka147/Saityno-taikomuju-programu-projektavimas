import { useEffect, useState } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  function checkIfMobile() {
    setIsMobile(window.innerWidth <= 768);
  }
  useEffect(() => {
    checkIfMobile();
    window.addEventListener("resize", () => {
      console.log(checkIfMobile()); // Will log true or false on resize
    });
  }, []);
  return isMobile;
};

export default useIsMobile;
