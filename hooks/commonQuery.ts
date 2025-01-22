import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useProgressMutation, useProgressQuery } from './progress';
import { useEffect } from 'react';
import { useNotification } from '@/stores/notificationStore';
import { router } from 'expo-router';

export { useCommonQuery, useCommonMutation };

function useCommonQuery<T>(options: UseQueryOptions<T, AxiosError, T>) {
  const query = useQuery<T, AxiosError, T>({
    ...options,
  });
  useProgressQuery(query, options.queryKey[0] as string);
  const addNotification = useNotification((state) => state.addNotification);

  useEffect(() => {
    if (query.isError && !query.isLoading) {
      if (query.error.status === 401) {
        addNotification({
          message: 'Session expired',
          code: '401',
        });
        router.push('/logout');
      } else {
        addNotification({
          message:
            (query.error.response as { data: { message: string } })?.data
              .message ?? query.error.message,
          code: query.error.status ? query.error.status.toString() : 'NA',
        });
      }
    }
  }, [query.isError, query.isLoading]);

  return query;
}

function useCommonMutation<ResponseType>(
  apiFunction: (...args: any) => Promise<ResponseType>,
  name: string,
  options?: {
    customName?: string;
    successNotification?: { message: string; code: string };
    errorNotification?: { message: string; code: string };
    onSuccess?: (response: ResponseType) => void;
    onError?: (error: AxiosError) => void;
  }
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const mutation = useMutation<ResponseType, AxiosError, unknown>({
    mutationFn: apiFunction,
    onSuccess: async (response: ResponseType) => {
      if (options?.successNotification) {
        addNotification(options.successNotification);
      } else {
        addNotification({
          message: 'Operación exitosa',
          code: '',
        });
      }
      await queryClient.invalidateQueries({ queryKey: [name] });
      if (options?.onSuccess) {
        options.onSuccess(response);
      }
    },
    onError: (error: AxiosError) => {
      const errorData: any = error.response?.data;
      if (errorData?.message) {
        addNotification({
          message: errorData.message,
          code: error.status ? error.status.toString() : 'NA',
        });
        if (options?.onError) {
          options.onError(error);
        }
        return;
      }
      if (options?.errorNotification) {
        addNotification(options.errorNotification);
      } else {
        addNotification({
          message: 'Error - ' + error.status,
          code: '',
        });
      }
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  function mutate(...variables: any) {
    if (!mutation.isPending) {
      mutation.mutate(variables);
    }
  }

  useProgressMutation(mutation, `${name}${options?.customName}`);
  return {
    ...mutation,
    mutate,
  };
}
