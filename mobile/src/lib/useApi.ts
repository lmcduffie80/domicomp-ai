import { useCallback, useRef } from "react";
import { useAuth } from "@clerk/react";
import { makeApi } from "./api";

type Api = ReturnType<typeof makeApi>;

export function useApi() {
  const { getToken } = useAuth();
  const tokenRef = useRef<string | null>(null);

  // Stable reference — only recreated when getToken identity changes (almost never)
  const getApi = useCallback(async (): Promise<Api> => {
    tokenRef.current = await getToken();
    return makeApi(tokenRef.current);
  }, [getToken]);

  // Memoized so useCallback deps in consumers stay stable
  const call = useCallback(
    async <T>(fn: (api: Api) => Promise<T>): Promise<T> => {
      const api = await getApi();
      return fn(api);
    },
    [getApi]
  );

  return { call, getApi };
}
