/* eslint-disable @typescript-eslint/no-unused-vars */
import { useMutation, UseMutationResult } from "@tanstack/react-query";
import instance from "~/services/axios";

function usePost() {
  return useMutation({
    mutationFn: ({ url, data }: { url: string; data: object }) =>
      instance.post(url, data).then((response) => {
        return response;
      }),
  });
}

export function usePatch() {
  return useMutation({
    mutationFn: ({ url, data }: { url: string; data?: object }) =>
      instance.patch(url, data).then((res) => res),
  });
}

export function useDelete() {
  return useMutation({
    mutationFn: (url: string) => instance.delete(url).then((res) => res),
  });
}

export default usePost;
