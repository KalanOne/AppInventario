import { getInventoryReport, getProductsList } from '@/api/inventario.api';
import { CDropdownInput } from '@/components/form/CDropdownInput';
import { CTextInput } from '@/components/form/CTextInput';
import { FilterModal } from '@/components/form/FilterModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner2 } from '@/components/scanner/Scanner2';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { Flex } from '@/components/UI/Flex';
import { useCommonMutation } from '@/hooks/commonQuery';
import { useCrud, useCrudQuery } from '@/hooks/crud';
import { useDependencies } from '@/hooks/dependencies';
import { Product as ProductResponse } from '@/types/inventario';
import { Product } from '@/types/searchs';
import { blobToBase64, deleteEmptyProperties } from '@/utils/other';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import {
  DataTable,
  Divider,
  IconButton,
  Modal,
  Portal,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useNotification } from '@/stores/notificationStore';

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
  const [fullInventoryModal, setFullInventoryModal] = useState(false);
  const [actionPdf, setActionPdf] = useState<'share' | 'print' | 'save'>(
    'print'
  );
  const addNotification = useNotification((state) => state.addNotification);

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

  const dependencies = useDependencies(['warehouses'], {}, ['warehouses']);

  const productFilterForm = useForm<
    ProductFilterInputType,
    unknown,
    ProductFilterSchemaType
  >({
    defaultValues: productFilterDefaultValues,
    resolver: zodResolver(productFilterSchema),
  });

  const [multipleFilter] = useWatch({
    control: productFilterForm.control,
    name: ['multiple'],
  });

  const transactionReportMutation = useCommonMutation(getInventoryReport, '', {
    onSuccess: async (response) => {
      try {
        const base64Data = await blobToBase64(response);
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        const dateString = `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
        if (actionPdf === 'print') {
          await Print.printAsync({
            uri: `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64Data}`,
          });
        } else if (actionPdf === 'share') {
          const fileUri = `${FileSystem.cacheDirectory}reporte_inventario_${dateString}.xlsx`;

          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          await Sharing.shareAsync(fileUri, {
            mimeType:
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Compartir reporte de inventario',
            UTI: 'org.openxmlformats.spreadsheetml.sheet',
          });
        } else if (actionPdf === 'save') {
          const permissions =
            await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
          if (!permissions.granted) {
            addNotification({
              message: 'Permiso denegado para guardar el archivo',
              code: '',
            });
            return;
          }
          const uri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            `reporte_inventario_${dateString}`,
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          );
          await FileSystem.StorageAccessFramework.writeAsStringAsync(
            uri,
            base64Data,
            {
              encoding: FileSystem.EncodingType.Base64,
            }
          );
          addNotification({
            message: 'Archivo guardado exitosamente',
            code: '',
          });
        }
      } catch (e) {
        addNotification({
          message: `Error al ${actionPdf == 'print' ? 'imprimir' : actionPdf == 'save' ? 'guardar' : 'compartir'} el archivo`,
          code: '',
        });
      }
    },
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

  function shareReport() {
    setActionPdf('share');
    transactionReportMutation.mutate();
  }

  function saveReport() {
    setActionPdf('save');
    transactionReportMutation.mutate();
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
        <IconButton
          icon="receipt"
          onPress={() => {
            setFullInventoryModal(true);
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
        <CDropdownInput
          name="multiple"
          label="Multiple"
          data={[
            { key: 'UNIDAD', value: 'UNIDAD' },
            { key: 'PAQUETE', value: 'PAQUETE' },
            { key: 'CAJA', value: 'CAJA' },
            { key: 'OTRO', value: 'OTRO' },
          ]}
          labelField={'key'}
          valueField={'value'}
        />
        <CTextInput
          name="factor"
          label="Factor"
          keyboardType="numeric"
          type="number"
          placeholder={
            !multipleFilter ? '1' : multipleFilter === 'UNIDAD' ? '1' : '12'
          }
        />
        <CDropdownInput
          name="warehouse"
          label="Almacen"
          data={dependencies.warehouses ?? []}
          labelField={'name'}
          valueField={'id'}
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
      <Scanner2
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
      <Portal>
        <Modal
          visible={fullInventoryModal}
          onDismiss={() => setFullInventoryModal(false)}
          contentContainerStyle={[
            styles.containerStyle,
            { backgroundColor: color.colors.surfaceBright },
          ]}
        >
          <Flex paddingX={10}>
            <Text variant="titleLarge" style={{ marginBottom: 10 }}>
              Reporte de inventario
            </Text>
            <Flex direction="row" justify="center">
              <IconButton
                icon="share-variant"
                mode="contained"
                onPress={shareReport}
              />
              <IconButton
                icon="content-save"
                mode="contained"
                onPress={saveReport}
              />
            </Flex>
          </Flex>
        </Modal>
      </Portal>
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
  containerStyle: {
    padding: 10,
    margin: 10,
    borderRadius: 10,
    elevation: 5,
    // backgroundColor: 'white', // o usa `color.colors.surfaceBright` si ya está en el modal
    alignSelf: 'center',
    width: '90%', // opcional: controla el ancho, pero no altura
  },
});

const productFilterSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  multiple: z.union([z.string(), z.null()]).optional(),
  factor: z.union([z.number(), z.literal('')]).optional(),
  warehouse: z.union([z.number(), z.null(), z.literal('')]).optional(),
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
  warehouse: '',
  serialNumber: '',
};
