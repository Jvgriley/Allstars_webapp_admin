import { useEffect, useState, type DependencyList } from "react";

/**
 * Small, shared foundation for turning a service call into React state.
 *
 * Every domain hook in `src/services/*` is built on this. It exists so
 * that swapping a mock service for a real API call later is purely a
 * service-layer change — the loading/error contract every page already
 * relies on doesn't move.
 */
export type AsyncState<T> = {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
};

export function useAsyncData<T>(fetcher: () => Promise<T>, deps: DependencyList = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: undefined });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: undefined }));

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: undefined });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ data: undefined, loading: false, error: error instanceof Error ? error : new Error(String(error)) });
      });

    return () => {
      cancelled = true;
    };
    // deps are provided by each call site; this hook is deliberately generic.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
