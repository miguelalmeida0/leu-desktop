import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  GraduationCap,
  Network,
  Compass,
  NotebookPen,
  House,
  Settings,
  ArrowUpRight,
} from "lucide-react";
import { useStore } from "../domain/store";
const links = [
  ["/library", "Library", BookOpen],
  ["/study", "Study", GraduationCap],
  ["/trails", "Trails", Network],
  ["/explore", "Explore", Compass],
  ["/notes", "Notes", NotebookPen],
  ["/", "Home", House],
  ["/settings", "Settings", Settings],
] as const;
export default function Shell() {
  const location = useLocation();
  const { error } = useStore();
  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() =>
      document.querySelector<HTMLElement>("h1")?.focus(),
    );
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="rail">
        <NavLink to="/" className="wordmark" aria-label="Leu home">
          Leu<span>.</span>
        </NavLink>
        <nav aria-label="Main navigation">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="rail-bottom">
          <span className="avatar">L</span>
          <div>
            <strong>Keep going</strong>
            <p>
              You’re building
              <br />a brighter you.
            </p>
          </div>
        </div>
        <NavLink to="/settings" className="demo-label">
          Demo mode <ArrowUpRight size={12} />
        </NavLink>
      </aside>
      <main
        id="main"
        className={
          location.pathname.startsWith("/reader") ? "main reader-main" : "main"
        }
      >
        {error && (
          <div className="storage-error" role="alert">
            {error}
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
