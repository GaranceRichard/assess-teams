import { useCallback, useEffect, useRef, useState } from "react";

const indexKey = "assessTeamsNavigationIndex";
const navigationProtected = () =>
  Boolean(
    document.querySelector('dialog[open][data-navigation-protected="true"]'),
  );

export function useProductNavigation() {
  const [path, setPath] = useState(window.location.pathname);
  const currentPath = useRef(path);
  const savedPosition = window.history.state?.[indexKey];
  const position = useRef(
    typeof savedPosition === "number" ? savedPosition : 0,
  );

  useEffect(() => {
    window.history.replaceState(
      { ...window.history.state, [indexKey]: position.current },
      "",
    );
    function updatePath(event: PopStateEvent) {
      const destination = event.state?.[indexKey];
      if (navigationProtected()) {
        if (
          typeof destination === "number" &&
          destination !== position.current
        ) {
          window.history.go(position.current - destination);
        } else if (window.location.pathname !== currentPath.current) {
          window.history.pushState(
            { ...window.history.state, [indexKey]: position.current },
            "",
            currentPath.current,
          );
        }
        return;
      }
      position.current = typeof destination === "number" ? destination : 0;
      currentPath.current = window.location.pathname;
      setPath(currentPath.current);
    }
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!navigationProtected()) return;
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("popstate", updatePath);
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("popstate", updatePath);
      window.removeEventListener("beforeunload", beforeUnload);
    };
  }, []);

  const replacePath = useCallback((nextPath: string) => {
    window.history.replaceState(
      { ...window.history.state, [indexKey]: position.current },
      "",
      nextPath,
    );
    currentPath.current = window.location.pathname;
    setPath(currentPath.current);
  }, []);

  function navigate(nextPath: string) {
    if (navigationProtected()) return;
    window.history.pushState(
      { ...window.history.state, [indexKey]: ++position.current },
      "",
      nextPath,
    );
    currentPath.current = window.location.pathname;
    setPath(currentPath.current);
  }

  return { path, navigate, replacePath };
}
