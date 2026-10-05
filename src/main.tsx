import { Component, lazy, Suspense, useEffect, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { StoreProvider } from "./domain/store";
import Shell from "./components/Shell";
import Home from "./pages/Home";
import Library from "./pages/Library";
import "./styles.css";
const Reader = lazy(() => import("./pages/Reader"));
const Study = lazy(() => import("./pages/Study"));
const Trails = lazy(() => import("./pages/Trails"));
const Notes = lazy(() => import("./pages/Notes"));
const Settings = lazy(() => import("./pages/Settings"));
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="empty">
        <h1>Let’s reopen your workspace.</h1>
        <p>
          This view could not load. Your saved notes are kept in this browser.
        </p>
        <a className="button" href="/">
          Reopen Leu
        </a>
      </div>
    ) : (
      this.props.children
    );
  }
}
function App() {
  const navigate = useNavigate();
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/library");
        setTimeout(
          () =>
            document.querySelector<HTMLInputElement>(".search input")?.focus(),
          100,
        );
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [navigate]);
  return (
    <StoreProvider>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            Opening your workspace…
          </div>
        }
      >
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Home />} />
            <Route path="library" element={<Library />} />
            <Route
              path="reader/:id"
              element={
                <Boundary>
                  <Reader />
                </Boundary>
              }
            />
            <Route
              path="study"
              element={
                <Boundary>
                  <Study />
                </Boundary>
              }
            />
            <Route path="trails" element={<Trails />} />
            <Route path="explore" element={<Trails />} />
            <Route path="notes" element={<Notes />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="*"
              element={
                <div className="empty">
                  <h1>Page not found</h1>
                  <a href="/library">Return to Library</a>
                </div>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </StoreProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <Boundary>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Boundary>,
);
