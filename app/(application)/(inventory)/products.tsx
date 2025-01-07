import { getProductsList } from '@/api/inventario.api';
import { CTextInput } from '@/components/form/CTextInput';
import { FilterModal } from '@/components/form/FilterModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner } from '@/components/scanner/Scanner';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { Flex } from '@/components/UI/Flex';
import { useCrud, useCrudQuery } from '@/hooks/crud';
import { Product as ProductResponse } from '@/types/inventario';
import { Product } from '@/types/searchs';
import { deleteEmptyProperties } from '@/utils/other';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  DataTable,
  Divider,
  IconButton,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';

export default function ProductList() {
  const color = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState<boolean>(false);
  const [barcodeScan, setBarcodeScan] = useState<{
    modal: boolean;
    origin: 'update' | 'create' | 'search' | 'filter' | null;
    input: 'barcode' | 'serial' | null;
  }>({
    modal: false,
    origin: null,
    input: null,
  });

  const crud = useCrud();
  const productsListQuery = useCrudQuery({
    apiFunction: getProductsList,
    name: 'productsList',
    page: crud.page,
    limit: crud.itemsPerPage,
    search: crud.search,
    filters: crud.filters,
    keepPrevious: true,
    extras: undefined,
  });
  const products = productsListQuery.data ? productsListQuery.data[0] : [];

  const productFilterForm = useForm<
    ProductFilterInputType,
    unknown,
    ProductFilterSchemaType
  >({
    defaultValues: productFilterDefaultValues,
    resolver: zodResolver(productFilterSchema),
  });

  function handleBarcodeScanClick(
    origin: 'update' | 'create' | 'search' | 'filter',
    input: 'barcode' | 'serial' | null = null
  ) {
    setBarcodeScan({ modal: true, origin: origin, input: input });
  }

  function handleSearchQuery() {
    crud.setSearch(searchQuery.toUpperCase());
  }

  function handleFilterPress() {
    crud.setFilterModalOpen(true);
  }

  function handleBarcodeScan(barcode: string) {
    if (barcodeScan.origin === 'search') {
      setSearchQuery(barcode);
      crud.setSearch(barcode);
    } else if (barcodeScan.origin === 'filter') {
      if (barcodeScan.input === 'serial') {
        productFilterForm.setValue('serialNumber', barcode);
      } else {
        productFilterForm.setValue('barcode', barcode);
      }
    }
    setBarcodeScan((prev) => ({ ...prev, modal: false }));
  }

  function handleFilterApply() {
    crud.setFilterModalOpen(false);
    const filters = deleteEmptyProperties(productFilterForm.getValues());
    const params = new URLSearchParams();
    for (const key in filters) {
      if (key != 'barcode') {
        params.append(
          key,
          `${filters[key as keyof ProductFilterInputType]?.toString().toUpperCase()}`
        );
      } else {
        params.append(key, `${filters[key]?.toString()}`);
      }
    }
    crud.setFilters(params);
  }

  function handleFilterReset() {
    productFilterForm.reset(productFilterDefaultValues);
    crud.setFilters(new URLSearchParams());
    crud.setFilterModalOpen(false);
  }

  function handleFoundProduct(product: Product) {
    setProductSearch(false);
    setSearchQuery('');
    handleSearchQuery();
    productFilterForm.reset(productFilterDefaultValues);
    productFilterForm.setValue('id', product.id);
    productFilterForm.setValue('name', product.name);
    productFilterForm.setValue('description', product.description ?? '');
    handleFilterApply();
  }

  function handleRowPress(item: ProductResponse) {
    router.navigate({
      pathname: '/(inventory)/products/[id]',
      params: { id: item.id },
    });
  }

  useEffect(() => {
    if (products) {
      crud.setTotal(productsListQuery.data ? productsListQuery.data[1] : 0);
    }
  }, [products]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Flex padding={10} direction="row">
        <IconButton
          icon="barcode-scan"
          onPress={() => handleBarcodeScanClick('search')}
          mode="contained"
        />
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
        <IconButton
          icon="filter"
          onPress={handleFilterPress}
          mode="contained"
        />
        <IconButton
          icon="open-in-new"
          onPress={() => {
            setProductSearch(true);
          }}
          mode="contained"
        />
      </Flex>
      <DataTable
        style={{
          flex: 1,
        }}
      >
        <DataTable.Header>
          <DataTable.Title style={styles.columnName}>
            Product name
          </DataTable.Title>
        </DataTable.Header>
        <ScrollView style={styles.scrollView}>
          {products.length > 0 &&
            products.map((item) => (
              <DataTable.Row
                key={item.id}
                onPress={() => {
                  handleRowPress(item);
                }}
              >
                <DataTable.Cell style={styles.columnName}>
                  {item.name}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          {!products.length && (
            <DataTable.Row>
              <DataTable.Cell centered style={styles.columnNoData}>
                No data
              </DataTable.Cell>
            </DataTable.Row>
          )}
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
        handleFilterDismiss={() => {
          crud.setFilterModalOpen(false);
        }}
        handleFilterApply={productFilterForm.handleSubmit(handleFilterApply)}
        handleFilterReset={handleFilterReset}
        handleFilterCancel={() => {
          crud.setFilterModalOpen(false);
        }}
        form={productFilterForm}
      >
        <Text>Producto</Text>
        <CTextInput name="id" label="ID" />
        <CTextInput name="name" label="Name" />
        <CTextInput name="description" label="Description" multiline />
        <Divider bold style={{ marginVertical: 5 }} />
        <Text>Artículo</Text>
        <CTextInput
          name="barcode"
          label="Barcode"
          flexStyles={{ flex: 1 }}
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('filter', 'barcode')}
              mode="contained"
            />
          }
        />
        <CTextInput name="multiple" label="Multiple" />
        <CTextInput
          name="factor"
          label="Factor"
          keyboardType="numeric"
          type="number"
        />
        <CTextInput
          name="serialNumber"
          label="Serial number"
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('filter', 'serial')}
              mode="contained"
            />
          }
        />
      </FilterModal>
      <Scanner
        visible={barcodeScan.modal}
        onDismissCancel={() =>
          setBarcodeScan((prev) => ({ ...prev, modal: false }))
        }
        onBarcodeScanned={handleBarcodeScan}
      />
      <ProductsSearch
        visible={productSearch}
        handleSearchDismissCancel={() => setProductSearch(false)}
        handleFoundProduct={handleFoundProduct}
      />
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
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
  columnNoData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const productFilterSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  multiple: z.string().optional(),
  factor: z.union([z.number(), z.literal('')]).optional(),
  serialNumber: z.string().optional(),
});

type ProductFilterSchemaType = z.infer<typeof productFilterSchema>;

type ProductFilterInputType = z.input<typeof productFilterSchema>;

const productFilterDefaultValues: ProductFilterInputType = {
  id: '',
  name: '',
  description: '',
  barcode: '',
  multiple: '',
  factor: '',
  serialNumber: '',
};
