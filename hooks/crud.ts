import { AxiosError } from 'axios';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

import { Notification, useNotification } from '@/stores/notificationStore';
import {
  CreateApiFunctionParams,
  DeleteApiFunctionParams,
  GetApiFunctionParams,
  PostApiFunctionParams,
  UpdateApiFunctionParams,
} from '@/types/api';
import { MessageResponse } from '@/types/response';
import {
  keepPreviousData,
  MutateOptions,
  MutationFunction,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';

import { useProgressMutation, useProgressQuery } from './progress';
import { useSessionStore } from '@/stores/sessionStore';
import { useStorageState } from './useStorageState';

export {
  useCrud,
  useCrudQuery,
  useCrudCreateMutation,
  useCrudUpdateMutation,
  useCrudDeleteMutation,
  useCrudCustomMutation,
  useCrudMutationF,
};

export type { MutationParams };

interface MutationParams {
  id?: number;
}

declare module '@tanstack/react-query' {
  interface Register {
    defaultError: AxiosError;
  }
}

function useCrud<T>() {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState(new URLSearchParams());
  const [search, setSearch] = useState('');
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [current, setCurrent] = useState<T>();
  const [total, setTotal] = useState(0);
  const [numberOfItemsPerPageList, setNumberOfItemsPerPageList] = useState([
    5, 10, 15, 25, 50,
  ]);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, total);
  const numberOfPages = Math.ceil(total / itemsPerPage);

  useEffect(() => {
    setPage(0);
  }, [search, filters, itemsPerPage]);

  return {
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    updateModalOpen,
    setUpdateModalOpen,
    createModalOpen,
    setCreateModalOpen,
    filterModalOpen,
    setFilterModalOpen,
    current,
    setCurrent,
    itemsPerPage,
    setItemsPerPage,
    total,
    setTotal,
    from,
    to,
    numberOfItemsPerPageList,
    setNumberOfItemsPerPageList,
    numberOfPages,
  };
}

interface UseCrudQueryParams<E, T> {
  apiFunction: (params: GetApiFunctionParams<E>) => T;
  name: string;
  page: number;
  limit: number;
  search: string;
  filters: URLSearchParams;
  keepPrevious: boolean;
  extras: E;
}

function useCrudQuery<E, T>({
  apiFunction,
  name,
  page,
  limit,
  search,
  filters,
  keepPrevious,
  extras,
}: UseCrudQueryParams<E, T>) {
  const query = useQuery<T, AxiosError, T>({
    placeholderData: keepPrevious ? keepPreviousData : undefined,
    queryKey: [name, page, limit, search, filters.toString(), extras],
    queryFn: () => {
      const params = new URLSearchParams(filters);
      params.append('skip', (page * limit).toString());
      params.append('limit', limit.toString());
      params.append('search', search);

      return apiFunction({
        params: params,
        extras: extras,
      });
    },
  });
  useProgressQuery(query, name);
  return query as UseQueryResult<Awaited<T>>;
}

interface UseCrudMutationOptions<ResponseType> {
  successNotification?: Notification;
  errorNotification?: Notification;
  onSuccess?: (response: ResponseType) => void;
  onError?: (error: AxiosError) => void;
}

interface UseCrudDeleteMutationOptions<MessageResponse> {
  successNotification?: Notification;
  errorNotification?: Notification;
  onSuccess?: (response: MessageResponse) => void;
  onError?: (error: AxiosError) => void;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////
interface UseCrudMutationOptionsF<ResponseType = any> {
  successNotification?: Notification;
  errorNotification?: Notification;
  onSuccess?: (response: ResponseType) => void;
  onError?: (error: AxiosError) => void;
  customName?: string;
}

type ApiFunctionType<KindType, SchemaType, E> = KindType extends 'create'
  ? CreateApiFunctionParams<SchemaType, E>
  : KindType extends 'update'
    ? UpdateApiFunctionParams<SchemaType, E>
    : KindType extends 'delete'
      ? DeleteApiFunctionParams<E>
      : PostApiFunctionParams<SchemaType, E>;

function useCrudMutationF<
  KindType extends 'create' | 'update' | 'delete' | 'custom',
  ResponseType,
  SchemaType,
  E,
>(
  apiFunction: (
    params: ApiFunctionType<KindType, SchemaType, E>
  ) => Promise<ResponseType>,
  name: string,
  kind: KindType,
  options?: UseCrudMutationOptionsF<ResponseType>
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const crudCreateMutationF = useMutation<
    ResponseType,
    AxiosError,
    ApiFunctionType<KindType, SchemaType, E>
  >({
    mutationFn: apiFunction as MutationFunction<
      ResponseType,
      ApiFunctionType<KindType, SchemaType, E>
    >,
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

  function mutate(
    variables: ApiFunctionType<KindType, SchemaType, E>,
    options?: MutateOptions<
      ResponseType,
      AxiosError<unknown, any>,
      ApiFunctionType<KindType, SchemaType, E>,
      unknown
    >
  ) {
    Keyboard.dismiss();
    if (!crudCreateMutationF.isPending) {
      crudCreateMutationF.mutate(variables, options);
    }
  }

  useProgressMutation(crudCreateMutationF, `${name}${options?.customName}`);
  return {
    ...crudCreateMutationF,
    mutate,
  };
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////

function useCrudCreateMutation<SchemaType, ResponseType>(
  apiFunction: (data: SchemaType) => Promise<ResponseType>,
  name: string,
  options?: UseCrudMutationOptions<ResponseType>
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const crudCreateMutation = useMutation({
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
      if (errorData.error.message) {
        addNotification({
          message: errorData.error.message,
          code: errorData.error.code,
        });
        return;
      }
      if (options?.errorNotification) {
        addNotification(options.errorNotification);
      } else {
        addNotification({
          message: 'Error',
          code: '',
        });
      }
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  useProgressMutation(crudCreateMutation, `${name}CreateMutation`);
  return crudCreateMutation;
}

function useCrudUpdateMutation<SchemaType, ResponseType>(
  apiFunction: (id: string | number, data: SchemaType) => Promise<ResponseType>,
  name: string,
  options?: UseCrudMutationOptions<ResponseType>
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const crudUpdateMutation = useMutation({
    mutationFn: async (data: MutationParams & SchemaType) => {
      if (!data.id) {
        throw new Error(`${name} is undefined`);
      }
      return await apiFunction(data.id, data);
    },
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
      if (errorData.error.message) {
        addNotification({
          message: errorData.error.message,
          code: errorData.error.code,
        });
        return;
      }
      if (options?.errorNotification) {
        addNotification(options.errorNotification);
      } else {
        addNotification({
          message: 'Error',
          code: '',
        });
      }
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  useProgressMutation(crudUpdateMutation, `${name}UpdateMutation`);
  return crudUpdateMutation;
}

function useCrudDeleteMutation<T = number | string>(
  apiFunction: (params: T) => Promise<MessageResponse>,
  name: string,
  options?: UseCrudDeleteMutationOptions<MessageResponse>
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const crudDeleteMutation = useMutation({
    mutationFn: async (params?: T) => {
      if (!params) {
        throw new Error(`${name} is undefined`);
      }
      return await apiFunction(params);
    },
    onSuccess: async (response: MessageResponse) => {
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
      if (errorData.error.message) {
        addNotification({
          message: errorData.error.message,
          code: errorData.error.code,
        });
        return;
      }
      if (options?.errorNotification) {
        addNotification(options.errorNotification);
      } else {
        addNotification({
          message: 'Error',
          code: '',
        });
      }
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  useProgressMutation(crudDeleteMutation, `${name}DeleteMutation`);
  return crudDeleteMutation;
}

function useCrudCustomMutation<SchemaType, ResponseType>(
  apiFunction: (id: string | number, data: SchemaType) => Promise<ResponseType>,
  name: string,
  customProgressId: string,
  options?: UseCrudMutationOptions<ResponseType>
) {
  const queryClient = useQueryClient();
  const addNotification = useNotification((state) => state.addNotification);

  const crudCustomMutation = useMutation({
    mutationFn: async (data: MutationParams & SchemaType) => {
      if (!data.id) {
        throw new Error(`${name} is undefined`);
      }
      return await apiFunction(data.id, data);
    },
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
      if (errorData.error.message) {
        addNotification({
          message: errorData.error.message,
          code: errorData.error.code,
        });
        return;
      }
      if (options?.errorNotification) {
        addNotification(options.errorNotification);
      } else {
        addNotification({
          message: 'Error',
          code: '',
        });
      }
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  useProgressMutation(crudCustomMutation, customProgressId);
  return crudCustomMutation;
}
