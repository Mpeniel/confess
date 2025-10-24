import { useLayoutEffect } from "react";

export const useNavbarOffset = (selector = "#site-header") => {
    useLayoutEffect(() => {
      const header = document.querySelector<HTMLElement>(selector);
      if (!header) return;
  
      const apply = () => {
        const h = header.getBoundingClientRect().height;
        console.log(h);
        document.documentElement.style.setProperty("--nav-h", `${h}px`);
      };
  
      apply(); // au montage
  
      const ro = new ResizeObserver(apply);
      ro.observe(header);
      window.addEventListener("resize", apply);
  
      return () => {
        ro.disconnect();
        window.removeEventListener("resize", apply);
      };
    }, [selector]);
  }