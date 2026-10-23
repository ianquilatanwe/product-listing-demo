import { useEffect, useRef, useState } from "react";
import { DEFAULT_VIEW, parseView, serializeView, type View } from "@/lib/catalog";

/**
 * The current View, kept in sync with the URL so refresh, Back/Forward and
 * shared links all restore it. `update` changes it; any change other than the
 * page resets to page 1. Pass `{ push: false }` for keystroke-level changes
 * (search typing) so they replace the history entry instead of adding one.
 */
export function useUrlView() {
  const [view, setView] = useState(DEFAULT_VIEW);
  const [urlRead, setUrlRead] = useState(false);
  const pushHistory = useRef(false);

  // URL → view: on load and on Back/Forward.
  useEffect(() => {
    const sync = () => setView(parseView(window.location.search));
    sync();
    setUrlRead(true);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  // View → URL.
  useEffect(() => {
    if (!urlRead) return; // don't wipe the incoming URL before it's been read
    const search = serializeView(view);
    if (search === window.location.search) return;
    const url = search || window.location.pathname;
    if (pushHistory.current) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
  }, [view, urlRead]);

  const update = (patch: Partial<View>, { push = true } = {}) => {
    pushHistory.current = push;
    setView((v) => ({ ...v, page: 1, ...patch }));
  };

  return [view, update] as const;
}
