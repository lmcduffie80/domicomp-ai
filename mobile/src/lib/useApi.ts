import { useCallback, useRef } from "react";
import { useAuth } from "@clerk/react";
import { makeApi } from "./api";

type Api = ReturnType<typeof makeApi>;

export function useApi() {
  const { getToken } = useAuth();
  const tokenRef = useRef<string | null>(null);

  const getApi = useCallback(async (): Promise<Api> => {
    tokenRef.current = await getToken();
    return makeApi(tokenRef.current);
  }, [getToken]);

  /** call(api => api.deals.list())  */
  async function call<T>(fn: (api: Api) => Promise<T>): Promise<T> {
    const api = await getApi();
    return fn(api);
  }

  return { call, getApi };
}
