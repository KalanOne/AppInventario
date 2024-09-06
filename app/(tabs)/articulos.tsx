import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  DataTable,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';

import { getArticulos } from '@/api/articulos.api';
import { Flex } from '@/components/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useCrud, useCrudQuery } from '@/hooks/crud';
import { Articulo, ArticulosResponse } from '@/types/articulos';
import { FilterModal } from '@/components/form/FilterModal';
import { CTextInput } from '@/components/form/CTextInput';
import { z } from 'zod';

export default function ArticulosScreen() {
  const color = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');

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

  function handleRowPress(item: Articulo) {
    console.log(item);
  }

  function handleSearchQuery() {
    crud.setSearch(searchQuery.toUpperCase());
  }

  function handleFilterPress() {
    crud.setFilterModalOpen(true);
  }

  function handleFilterChange() {
    console.log('Filter change');
  }

  function handleFilterApply() {
    console.log('Filter apply');
  }

  function handleFilterClear() {
    console.log('Filter clear');
  }

  function handleFilterDismiss() {
    crud.setFilterModalOpen(false);
  }

  function handleFilterReset() {
    console.log('Filter reset');
  }

  useEffect(() => {
    if (articles) {
      crud.setTotal(articulosQuery.data ? articulosQuery.data[1] : 0);
    }
  }, [articles]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Flex padding={10} direction="row">
        <Searchbar
          placeholder="Search"
          onChangeText={setSearchQuery}
          value={searchQuery}
          onIconPress={handleSearchQuery}
          onEndEditing={handleSearchQuery}
          onClearIconPress={() => {
            crud.setSearch('');
            setSearchQuery('');
          }}
          style={{ flex: 1 }}
        />
        <IconButton icon="filter" onPress={handleFilterPress} />
      </Flex>
      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={styles.columnName}>
            Product name
          </DataTable.Title>
          <DataTable.Title style={styles.columnShort}>Multiple</DataTable.Title>
          <DataTable.Title style={styles.columnShort} numeric>
            Factor
          </DataTable.Title>
        </DataTable.Header>
        <ScrollView style={styles.scrollView}>
          {articles.map((item) => (
            <DataTable.Row
              key={item.id}
              onPress={() => {
                handleRowPress(item);
              }}
            >
              <DataTable.Cell style={styles.columnName}>
                {item.product.name}
              </DataTable.Cell>
              <DataTable.Cell style={styles.columnShort}>
                {item.multiple}
              </DataTable.Cell>
              <DataTable.Cell style={styles.columnShort} numeric>
                {item.factor}
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </ScrollView>
        <DataTable.Pagination
          page={crud.page}
          numberOfPages={crud.numberOfPages}
          onPageChange={crud.setPage}
          label={`${crud.from + 1}-${crud.to} of ${crud.total}`}
          numberOfItemsPerPageList={crud.numberOfItemsPerPageList}
          numberOfItemsPerPage={crud.itemsPerPage}
          onItemsPerPageChange={crud.setItemsPerPage}
          showFastPaginationControls
          selectPageDropdownLabel={'Rows per page'}
        />
      </DataTable>
      <FilterModal
        visible={crud.filterModalOpen}
        handleFilterDismiss={handleFilterDismiss}
        handleFilterApply={handleFilterApply}
        handleFilterReset={handleFilterReset}
        handleFilterCancel={handleFilterDismiss}
      >
        <TextInput></TextInput>
        <TextInput></TextInput>
        <TextInput></TextInput>
      </FilterModal>
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '70%',
  },
  columnName: {
    flex: 3,
  },
  columnShort: {
    flex: 1,
  },
  searchContainer: {
    padding: 10,
  },
});

const filterArticleSchema = z.object({
  
});

type FilterArticleSchemaType = z.infer<typeof filterArticleSchema>;

type FilterArticleInputType = z.input<typeof filterArticleSchema>;

const filterArticleDefaultValues: FilterArticleInputType = {
  email: '',
  password: '',
};
