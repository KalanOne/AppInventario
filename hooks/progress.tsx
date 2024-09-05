import { useEffect } from "react";

import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { useProgressStore } from "@/stores/progress";


export { useProgressQuery, useProgressMutation };

function useProgressQuery(query: UseQueryResult, id: string) {
  const addProgress = useProgressStore((state) => state.addProgress);
  const removeProgress = useProgressStore((state) => state.removeProgress);

  useEffect(() => {
    if (query.isFetching) {
      addProgress(id);
    } else {
      removeProgress(id);
    }
  }, [query.isFetching]);
}

function useProgressMutation(
  mutation: UseMutationResult<any, any, any, any>,
  id: string,
) {
  const addProgress = useProgressStore((state) => state.addProgress);
  const removeProgress = useProgressStore((state) => state.removeProgress);

  useEffect(() => {
    if (mutation.isPending) {
      addProgress(id);
    } else {
      removeProgress(id);
    }
  }, [mutation.isPending]);
}