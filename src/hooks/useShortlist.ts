import { useStoredState } from "./useStoredState";

/** Shortlisted product ids, saved on the device. */
export function useShortlist() {
  const [ids, setIds] = useStoredState<number[]>("shortlist", []);
  return {
    ids,
    has: (id: number) => ids.includes(id),
    toggle: (id: number) => setIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
  };
}
