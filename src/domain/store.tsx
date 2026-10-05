import { createContext, useContext, useState, type ReactNode } from "react";
import {
  documents,
  initialState,
  stateSchema,
  STORAGE_KEY,
  type LearnerState,
  type Document,
} from "./model";

function load(): { state: LearnerState; error: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: initialState(), error: "" };
    return { state: stateSchema.parse(JSON.parse(raw)), error: "" };
  } catch {
    return {
      state: initialState(),
      error:
        "Saved data could not be read. This session is using the sample library. Reset demo to restore local storage.",
    };
  }
}
type Store = {
  state: LearnerState;
  allDocuments: Document[];
  error: string;
  update: (fn: (s: LearnerState) => LearnerState) => boolean;
  reset: () => boolean;
};
const Context = createContext<Store | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [boot] = useState(load);
  const [state, setState] = useState(boot.state);
  const [error, setError] = useState(boot.error);
  const update: Store["update"] = (fn) => {
    try {
      const next = stateSchema.parse(fn(state));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setState(next);
      setError("");
      return true;
    } catch {
      setError(
        "Your change was not saved. Local storage may be full or unavailable. Free space or allow site storage, then try again.",
      );
      return false;
    }
  };
  const reset = () => update(() => initialState());
  return (
    <Context.Provider
      value={{
        state,
        allDocuments: [...documents, ...state.imported],
        error,
        update,
        reset,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("Missing store");
  return store;
}
