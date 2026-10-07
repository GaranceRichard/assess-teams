import { useEffect, useRef, useState, type SetStateAction } from "react";
import { collectionPage, type CollectionPage } from "./collectionPage";

export function usePagedCollection<T>(
  load: (page: number) => Promise<CollectionPage<T> | T[]>,
  scope: string = "",
  enabled = true,
) {
  const mutations = useRef(0);
  const activeScope = useRef(scope);
  const [selection, setSelection] = useState({ scope, page: 1 });
  const [data, setData] = useState({ scope, items: [] as T[], count: 0 });
  const [loading, setLoading] = useState(enabled);
  const [failed, setFailed] = useState(false);
  const [settledScope, setSettledScope] = useState(scope);
  const [attempt, setAttempt] = useState(0);
  const count = data.scope === scope ? data.count : 0;
  const requested = selection.scope === scope ? selection.page : 1;
  const page = Math.min(requested, Math.max(1, Math.ceil(count / 20))) || 1;
  if (selection.scope === scope && requested !== page)
    setSelection({ scope, page });
  useEffect(() => {
    activeScope.current = scope;
    if (!enabled) return;
    let active = true;
    const revision = mutations.current;
    load(page).then(
      (response) => {
        if (!active || revision !== mutations.current) return;
        const result = collectionPage(response);
        setData({ scope, items: result.results, count: result.count });
        setSettledScope(scope);
        setFailed(false);
        setLoading(false);
      },
      () => {
        if (active && revision === mutations.current) {
          setSettledScope(scope);
          setFailed(true);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [load, page, scope, enabled, attempt]);
  function changePage(value: number) {
    setLoading(true);
    setSelection({ scope, page: value });
  }
  function setItems(update: SetStateAction<T[]>) {
    if (activeScope.current !== scope) return;
    mutations.current += 1;
    setLoading(count >= 20);
    setSettledScope(scope);
    setFailed(false);
    if (count >= 20) setAttempt((value) => value + 1);
    setData((previous) => {
      const current =
        previous.scope === scope
          ? previous
          : { scope, items: [] as T[], count: 0 };
      const items =
        typeof update === "function" ? update(current.items) : update;
      return {
        ...current,
        items,
        count: current.count + items.length - current.items.length,
      };
    });
  }
  return {
    items: data.scope === scope ? data.items : [],
    setItems,
    count,
    page,
    changePage,
    loading: enabled && (loading || settledScope !== scope),
    failed: failed && settledScope === scope,
    reload: () => {
      setLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
