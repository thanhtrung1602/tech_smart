import { useMutation, UseMutationResult } from "@tanstack/react-query";
import instance from "~/services/axios";

function useDelete() {
    return useMutation({
        mutationFn: ({ url, data }: { url: string; data?: object }) =>
            instance.delete(url, data).then((response) => {
                return response;
            }),
    });
}

export default useDelete;