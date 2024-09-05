import { getArticulos } from '@/api/articulos.api';
import { Flex } from '@/components/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useCrud, useCrudQuery } from '@/hooks/crud';
import { ArticulosResponse } from '@/types/articulos';
import { useEffect, useState } from 'react';
import { DataTable } from 'react-native-paper';

export default function ArticulosScreen() {
  const color = useAppTheme();

  const crud = useCrud<ArticulosResponse>();
  const articulosQuery = useCrudQuery({
    apiFunction: getArticulos,
    name: 'articulos',
    page: crud.page,
    limit: crud.itemsPerPage,
    search: crud.search,
    filters: crud.filters,
    keepPrevious: true,
    extras: undefined,
  });
  const articles = articulosQuery.data ? articulosQuery.data[0] : [];

  useEffect(() => {
    if (articles) {
      crud.setTotal(articulosQuery.data ? articulosQuery.data[1] : 0);
    }
  }, [articles]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title sortDirection="descending">Dessert</DataTable.Title>
          <DataTable.Title numeric>Calories</DataTable.Title>
          <DataTable.Title numeric>Fat</DataTable.Title>
        </DataTable.Header>

        {articles.map((item: any) => (
          <DataTable.Row key={item.id}>
            <DataTable.Cell>{item.name}</DataTable.Cell>
            <DataTable.Cell numeric>{item.calories}</DataTable.Cell>
            <DataTable.Cell numeric>{item.fat}</DataTable.Cell>
          </DataTable.Row>
        ))}

        <DataTable.Pagination
          page={crud.page}
          numberOfPages={crud.numberOfPages}
          onPageChange={crud.setPage}
          label={`${crud.from + 1}-${crud.to} of ${crud.total}`}
          numberOfItemsPerPageList={crud.numberOfItemsPerPageList}
          numberOfItemsPerPage={crud.itemsPerPage}
          onItemsPerPageChange={crud.onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={'Rows per page'}
        />
      </DataTable>
    </Flex>
  );
}
