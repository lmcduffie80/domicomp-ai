import { useAuth } from "@clerk/react";
import { useMemo, useRef, useCallback } from "react";
import { makeApi } from "./api";

export function useApi() {
  const { getToken } = useAuth();
  const tokenRef = useRef<string | null>(null);

  const refreshToken = useCallback(async () => {
    tokenRef.current = await getToken();
  }, [getToken]);

  const api = useMemo(() => {
    // We'll refresh inline on each call
    return {
      async call<T>(fn: (api: ReturnType<typeof makeApi>) => Promise<T>): Promise<T> {
        if (!tokenRef.current) {
          tokenRef.current = await getToken();
        }
        return fn(makeApi(tokenRef.current));
      },
    };
  }, [getToken]);

  return { api, refreshToken };
}
