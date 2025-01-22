import { useCallback, useEffect, useRef, useState } from 'react';

import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { Almacen } from '@/types/dependencies';
import { getWarehouses } from '@/api/dependencies.api';
import { useProgressQuery } from './progress';
import { useFocusEffect } from 'expo-router';

export { useDependencies };

export type { UseDependenciesReturn };

interface UseDependenciesFilterValues {
  // corporate_id?: string | number;
  // brands?: number[];
  // brandRetread?: string | number;
  // company_id?: string | number;
  // subsidiary_id?: string | number;
  // models?: number[];
  // subsidiaries?: number[];
}

type DependenciesKeys = 'warehouses' | 'products' | 'articles' | 'transactions';

interface UseDependenciesObject {
  name: DependenciesKeys;
  scope?: string;
  params?: Record<string, unknown>;
}

type UseDependenciesElement = DependenciesKeys | UseDependenciesObject;

interface UseDependenciesReturn {
  warehouses?: Almacen[];
  done?: boolean;
}

function hasKey(
  key: DependenciesKeys,
  elements: UseDependenciesElement[]
): boolean {
  return elements.some((e) => {
    if (typeof e === 'string') {
      return e === key;
    }
    return e.name === key;
  });
}

function getKey(
  key: DependenciesKeys,
  elements: UseDependenciesElement[]
): UseDependenciesObject | DependenciesKeys | '' {
  const element = elements.find((e) => {
    if (typeof e === 'string') {
      return e === key;
    }
    return e.name === key;
  });
  return element ?? '';
}

function getScope(
  element: UseDependenciesElement,
  defaultValue: string
): string {
  if (typeof element === 'string') {
    return defaultValue;
  }
  return element.scope ?? defaultValue;
}

function getAdditionalParams(element: UseDependenciesElement) {
  if (typeof element === 'string') {
    return {};
  }
  return element.params ?? {};
}

function useQueriesDone(queries: UseQueryResult<unknown>[]): boolean {
  const [done, setDone] = useState(false);

  const allQueriesDone = queries.every((query) => query.isSuccess);

  useEffect(() => {
    if (allQueriesDone) {
      setDone(true);
    }
  }, [allQueriesDone]);

  return done;
}

function useDependencies(
  elements: UseDependenciesElement[],
  _filterValues: UseDependenciesFilterValues, // TODO: Implement filterValues
  querysDone: DependenciesKeys[] = []
): UseDependenciesReturn {
  let dependencies = {};
  const querysArray = [];
  const firstLoad = useRef(true);

  if (hasKey('warehouses', elements)) {
    const warehousesElement = getKey('warehouses', elements);
    const warehousesDependencyQuery = useQuery({
      queryKey: ['warehousesDependencyQuery'],
      queryFn: async () => {
        return await getWarehouses(
          new URLSearchParams({
            ...(warehousesElement instanceof Object
              ? { scope: getScope(warehousesElement, 'id, name') }
              : {}),
            ...(warehousesElement
              ? getAdditionalParams(warehousesElement)
              : {}),
          })
        );
      },
      refetchInterval: 30 * 60000,
    });
    const warehouses = warehousesDependencyQuery.data ?? [];
    useProgressQuery(warehousesDependencyQuery, 'warehousesDependencyQuery');
    dependencies = { ...dependencies, warehouses };
    if (querysDone.includes('warehouses')) {
      querysArray.push(warehousesDependencyQuery);
    }
    useFocusEffect(
      useCallback(() => {
        if (firstLoad.current) {
          firstLoad.current = false;
          return;
        }
        warehousesDependencyQuery.refetch();
      }, [])
    );
  }

  const done = useQueriesDone(querysArray);
  dependencies = { ...dependencies, done };
  return dependencies;
}
