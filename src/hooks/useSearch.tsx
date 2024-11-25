/* eslint-disable @typescript-eslint/no-unused-vars */
import instance from "~/services/axios";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
export default function useSearch<T>(url: string, key: string, staleTime: number = 5 * 60 * 1000,) {
  return useQuery<T>({
    queryKey: [url, key],
    queryFn: async () => {
      const { data } = await instance.get<T>(url, {
        params: {
          q: key,
        },
      });
      return data;
    },
    staleTime,
    enabled: !!key,
  });
}
