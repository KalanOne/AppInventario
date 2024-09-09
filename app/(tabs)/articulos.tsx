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
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { router } from 'expo-router';
import { useNotification } from '@/stores/notificationStore';

export default function ArticulosScreen() {
  const color = useAppTheme();
  const addNotification = useNotification((state) => state.addNotification);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const data = [
    { key: '1', value: 'Mobiles', disabled: true },
    { key: '2', value: 'Appliances' },
    { key: '3', value: 'Cameras' },
    { key: '4', value: 'Computers', disabled: true },
    { key: '5', value: 'Vegetables' },
    { key: '6', value: 'Diary Products' },
    { key: '7', value: 'Drinks' },
    { key: '8', value: 'Biscuits' },
    { key: '9', value: 'Snacks' },
    { key: '10', value: 'Fruits' },
    { key: '11', value: 'Beverages' },
    { key: '12', value: 'Beauty & Hygiene' },
    { key: '13', value: 'Bakery Cakes & Dairy' },
    { key: '14', value: 'Cleaning & Household' },
    { key: '15', value: 'Kitchen' },
    { key: '16', value: 'Pet Care' },
    { key: '17', value: 'Gourmet & World Food' },
  ];

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

  function handleFilterApply() {
    console.log('Filter apply');
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

  useEffect(() => {
    if (
      articulosQuery.isError &&
      !articulosQuery.isLoading &&
      articulosQuery.error.status === 401
    ) {
      addNotification({
        message: 'Session expired',
        code: '401',
      });
      router.push('/logout');
    }
  }, [articulosQuery.isError]);

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
        <MultipleSelectList
          setSelected={(val: any) => setSelected(val)}
          data={data}
          save="key"
          label="Categories"
          maxHeight={200}
        />
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

const filterArticleSchema = z.object({});

type FilterArticleSchemaType = z.infer<typeof filterArticleSchema>;

type FilterArticleInputType = z.input<typeof filterArticleSchema>;

const filterArticleDefaultValues: FilterArticleInputType = {
  email: '',
  password: '',
};
