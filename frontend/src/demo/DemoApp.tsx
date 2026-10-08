import { useEffect, useState } from "react";
import { ProductShell } from "../ProductShell";
import { EvaluationTakingPage } from "../EvaluationTakingPage";
import { SteeringPage } from "../SteeringPage";
import { type Theme } from "../theme";
import { DemoTemplates } from "./DemoTemplates";
import { DemoResults } from "./DemoResults";
import { DemoPreview, DemoTeams } from "./DemoPreview";
import { resetDemo } from "./store";
import { user } from "./fixtures";
import "../styles.css";
import "../sidebar.css";
import "../theme.css";
import "../palette.css";
import "../product-layout.css";
import "../product-panels.css";
import "./demo.css";
const currentPath = () =>
  (window.location.hash.slice(1) || "/dashboard").split("?")[0];
const hints: Record<string, string> = {
  "/dashboard":
    "Mesurer pour accompagner, pas pour surveiller. Découvrez les équipes, puis essayez une passation.",
  "/teams":
    "Trois contextes différents, un même modèle pour ouvrir la discussion.",
  "/templates":
    "Modifiez un brouillon sans altérer les observations historiques.",
  "/evaluations":
    "Choisissez une équipe dans le tableau, notez chaque critère de 0 à 10, puis terminez la passation.",
  "/results":
    "Comparez les équipes et cliquez sur un critère pour explorer sa trajectoire.",
  "/steering":
    "Scénario du 8 octobre 2026 · Couverture et échéances, sans classement ni performance individuelle.",
};
export function DemoApp() {
  const [path, setPath] = useState(currentPath);
  const [theme, setTheme] = useState<Theme>("day");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    const update = () => setPath(currentPath());
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  function navigate(next: string) {
    window.location.hash = next;
    setPath(next.split("?")[0]);
  }
  function reset() {
    resetDemo();
    setTheme("day");
    setGeneration((g) => g + 1);
    navigate("/dashboard");
  }
  const content =
    path === "/dashboard" ? undefined : path === "/templates" ? (
      <DemoTemplates />
    ) : path === "/teams" ? (
      <DemoTeams />
    ) : path === "/results" ? (
      <DemoResults theme={theme} />
    ) : path === "/evaluations" ? (
      <EvaluationTakingPage actor={user} />
    ) : path === "/steering" ? (
      <SteeringPage actor={user} onNavigate={navigate} />
    ) : (
      <DemoPreview path={path} />
    );
  return (
    <ProductShell
      key={generation}
      user={user}
      path={path}
      onNavigate={navigate}
      onLogout={async () => {}}
      theme={theme}
      onThemeChange={setTheme}
      pageContent={content}
      appearanceDescription="Votre couleur reste active pendant cette ouverture. Le rafraîchissement ou la réinitialisation restaure les données de départ."
      headerAction={
        <button className="secondary" onClick={reset}>
          Réinitialiser la démo
        </button>
      }
      pageNotice={
        <aside className="demo-notice" aria-label="Démonstration">
          <strong>Démonstration — données fictives</strong>
          <span>
            {hints[path] ?? "Aperçu du produit · opérations non simulées."}
          </span>
        </aside>
      }
    />
  );
}
