import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet } from 'react-native';
import {
  DataTable,
  Divider,
  IconButton,
  Searchbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';

import {
  createArticles,
  getArticles,
  updateArticles,
} from '@/api/articulos.api';
import { Flex } from '@/components/UI/Flex';
import { CreateModal } from '@/components/form/CreateModal';
import { CTextInput } from '@/components/form/CTextInput';
import { FilterModal } from '@/components/form/FilterModal';
import { UpdateModal } from '@/components/form/UpdateModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner } from '@/components/scanner/Scanner';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { useCrud, useCrudMutationF, useCrudQuery } from '@/hooks/crud';
import { Articulo, ArticuloCreate, ArticulosResponse } from '@/types/articulos';
import { Product } from '@/types/searchs';
import { deleteEmptyProperties } from '@/utils/other';
import { zodResolver } from '@hookform/resolvers/zod';
import { CSelectInput } from '@/components/form/CSelectInput';
import { CDropdownInput } from '@/components/form/CDropdownInput';

export default function ArticulosScreen() {
  const color = useAppTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [productSearch, setProductSearch] = useState<{
    modal: boolean;
    origin: 'update' | 'create' | null;
  }>({ modal: false, origin: null });
  const [barcodeScan, setBarcodeScan] = useState<{
    modal: boolean;
    origin: 'update' | 'create' | 'search' | 'filter' | null;
    input: 'barcode' | 'serial' | null;
  }>({
    modal: false,
    origin: null,
    input: null,
  });

  const crud = useCrud<ArticulosResponse>();
  const articlesQuery = useCrudQuery({
    apiFunction: getArticles,
    name: 'articles',
    page: crud.page,
    limit: crud.itemsPerPage,
    search: crud.search,
    filters: crud.filters,
    keepPrevious: true,
    extras: undefined,
  });
  const articles = articlesQuery.data ? articlesQuery.data[0] : [];

  const articlesUpdateMutation = useCrudMutationF(
    updateArticles,
    'articles',
    'update',
    {
      onSuccess: () => {
        crud.setUpdateModalOpen(false);
      },
    }
  );

  const articlesCreateMutation = useCrudMutationF(
    createArticles,
    'articles',
    'create',
    {
      onSuccess: () => {
        crud.setCreateModalOpen(false);
      },
    }
  );

  const articleFilterForm = useForm<
    ArticleFilterInputType,
    unknown,
    ArticleFilterSchemaType
  >({
    defaultValues: articleFilterDefaultValues,
    resolver: zodResolver(articleFilterSchema),
  });

  const [multipleFilter] = useWatch({
    control: articleFilterForm.control,
    name: ['multiple'],
  });

  const articleUpdateForm = useForm<
    ArticleUpdateInputType,
    unknown,
    ArticleUpdateSchemaType
  >({
    defaultValues: articleUpdateDefaultValues,
    resolver: zodResolver(articleUpdateSchema),
  });

  const [multipleUpdate] = useWatch({
    control: articleUpdateForm.control,
    name: ['multiple'],
  });

  const articleCreateForm = useForm<
    ArticleCreateInputType,
    unknown,
    ArticleCreateSchemaType
  >({
    defaultValues: articleCreateDefaultValues,
    resolver: zodResolver(articleCreateSchema),
  });

  const [multipleCreate] = useWatch({
    control: articleCreateForm.control,
    name: ['multiple'],
  });

  function handleRowPress(item: Articulo) {
    crud.setUpdateModalOpen(true);
    articleUpdateForm.reset({
      productId: item.product.id,
      articleId: item.id,
      name: item.product.name,
      description: item.product.description,
      barcode: item.barcode,
      multiple: item.multiple,
      factor: item.factor,
      almacen: item.almacen ?? '',
    });
  }

  function handleSearchQuery() {
    crud.setSearch(searchQuery.toUpperCase());
  }

  function handleFilterPress() {
    crud.setFilterModalOpen(true);
  }

  function handleFilterApply() {
    crud.setFilterModalOpen(false);
    const filters = deleteEmptyProperties(articleFilterForm.getValues());
    const params = new URLSearchParams();
    for (const key in filters) {
      if (key != 'barcode') {
        params.append(
          key,
          `${filters[key as keyof ArticleFilterInputType]?.toString().toUpperCase()}`
        );
      } else {
        params.append(key, `${filters[key]?.toString()}`);
      }
    }
    crud.setFilters(params);
  }

  function handleFilterReset() {
    articleFilterForm.reset(articleFilterDefaultValues);
    crud.setFilters(new URLSearchParams());
    crud.setFilterModalOpen(false);
  }

  function handleUpdateApply(data: ArticleUpdateInputType) {
    articlesUpdateMutation.mutate({
      id: data.articleId,
      data,
      extras: undefined,
    });
  }

  function handleCreatePress() {
    crud.setCreateModalOpen(true);
  }

  function handleSearchProductCreatePress() {
    setProductSearch({ modal: true, origin: 'create' });
  }

  function handleFoundProduct(product: Product) {
    if (productSearch.origin === 'create') {
      articleCreateForm.setValue('productId', product.id);
      articleCreateForm.setValue('name', product.name);
      articleCreateForm.setValue('description', product.description || '');
    } else if (productSearch.origin === 'update') {
      articleUpdateForm.setValue('productId', product.id);
      articleUpdateForm.setValue('name', product.name);
      articleUpdateForm.setValue('description', product.description || '');
    }
    setProductSearch((prev) => ({ ...prev, modal: false }));
  }

  function handleCreateReset() {
    articleCreateForm.reset(articleCreateDefaultValues);
    crud.setCreateModalOpen(false);
  }

  function handleCreateApply(data: ArticleCreateInputType) {
    const newData: ArticuloCreate = {
      productId: data.productId ? data.productId : undefined,
      name: data.name.toUpperCase(),
      description: data.description.toUpperCase(),
      barcode: data.barcode,
      multiple: data.multiple.toUpperCase(),
      factor: data.factor,
      almacen: data.almacen ? data.almacen.toUpperCase() : undefined,
    };
    articlesCreateMutation.mutate(
      {
        data: newData,
        extras: undefined,
      },
      {
        onSuccess: () => {
          articleCreateForm.reset(articleCreateDefaultValues);
        },
      }
    );
  }

  function handleBarcodeScanClick(
    origin: 'update' | 'create' | 'search' | 'filter',
    input: 'barcode' | 'serial' | null = null
  ) {
    setBarcodeScan({ modal: true, origin: origin, input: input });
  }

  function handleBarcodeScan(barcode: string) {
    if (barcodeScan.origin === 'create') {
      articleCreateForm.setValue('barcode', barcode);
    } else if (barcodeScan.origin === 'update') {
      articleUpdateForm.setValue('barcode', barcode);
    } else if (barcodeScan.origin === 'search') {
      setSearchQuery(barcode);
      crud.setSearch(barcode);
    } else if (barcodeScan.origin === 'filter') {
      if (barcodeScan.input === 'serial') {
        articleFilterForm.setValue('serialNumber', barcode);
      } else {
        articleFilterForm.setValue('barcode', barcode);
      }
    }
    setBarcodeScan((prev) => ({ ...prev, modal: false }));
  }

  useEffect(() => {
    if (articles) {
      crud.setTotal(articlesQuery.data ? articlesQuery.data[1] : 0);
    }
  }, [articles]);

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
          icon="plus-thick"
          onPress={handleCreatePress}
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
          <DataTable.Title style={styles.columnShort}>Multiple</DataTable.Title>
          <DataTable.Title style={styles.columnShort} numeric>
            Factor
          </DataTable.Title>
        </DataTable.Header>
        <ScrollView style={styles.scrollView}>
          {articles.length > 0 &&
            articles.map((item) => (
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
          {!articles.length && (
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
        handleFilterApply={articleFilterForm.handleSubmit(handleFilterApply)}
        handleFilterReset={handleFilterReset}
        handleFilterCancel={() => {
          crud.setFilterModalOpen(false);
        }}
        form={articleFilterForm}
      >
        <Text>Producto</Text>
        <CTextInput name="name" label="Name" />
        <CTextInput name="description" label="Description" multiline />
        <Divider />
        <Text>Artículo</Text>
        <CTextInput
          name="barcode"
          label="Barcode"
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
        <CTextInput name="almacen" label="Almacen" />
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
      <UpdateModal
        visible={crud.updateModalOpen}
        handleUpdateDismiss={() => {
          crud.setUpdateModalOpen(false);
        }}
        handleUpdateApply={articleUpdateForm.handleSubmit(handleUpdateApply)}
        handleUpdateCancel={() => {
          crud.setUpdateModalOpen(false);
        }}
        form={articleUpdateForm}
      >
        <Text>Producto</Text>
        <CTextInput name="name" label="Name" />
        <CTextInput name="description" label="Description" multiline />
        <Divider />
        <Text>Artículo</Text>
        <CTextInput
          name="barcode"
          label="Barcode"
          flexStyles={{ flex: 1 }}
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('update', 'barcode')}
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
            !multipleUpdate ? '1' : multipleUpdate === 'UNIDAD' ? '1' : '12'
          }
        />
        <CTextInput name="almacen" label="Almacen" />
      </UpdateModal>
      <CreateModal
        visible={crud.createModalOpen}
        handleCreateDismiss={() => {
          crud.setCreateModalOpen(false);
        }}
        handleCreateApply={articleCreateForm.handleSubmit(handleCreateApply)}
        handleCreateCancel={() => {
          crud.setCreateModalOpen(false);
        }}
        handleCreateReset={handleCreateReset}
        form={articleCreateForm}
      >
        <Text>Producto</Text>
        <CTextInput
          name="productId"
          label="Id"
          helperText={
            'Si no se selecciona un producto, se creará uno nuevo (<=0 o vacio)'
          }
          type="number"
          keyboardType="numeric"
          right={
            <TextInput.Icon
              icon="magnify"
              onPress={handleSearchProductCreatePress}
              mode="contained"
            />
          }
        />
        <CTextInput name="name" label="Name" />
        <CTextInput name="description" label="Description" multiline />
        <Divider />
        <Text>Artículo</Text>
        <CTextInput
          name="barcode"
          label="Barcode"
          flexStyles={{ flex: 1 }}
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('create', 'barcode')}
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
            !multipleUpdate ? '1' : multipleUpdate === 'UNIDAD' ? '1' : '12'
          }
        />
        <CTextInput name="almacen" label="Almacen" />
      </CreateModal>
      <ProductsSearch
        visible={productSearch.modal}
        handleSearchDismissCancel={() =>
          setProductSearch((prev) => ({ ...prev, modal: false }))
        }
        handleFoundProduct={handleFoundProduct}
      />
      <Scanner
        visible={barcodeScan.modal}
        onDismissCancel={() =>
          setBarcodeScan((prev) => ({ ...prev, modal: false }))
        }
        onBarcodeScanned={handleBarcodeScan}
      />
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
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

const articleFilterSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  barcode: z.string().optional(),
  multiple: z.union([z.string(), z.null()]).optional(),
  factor: z.union([z.number(), z.literal('')]).optional(),
  almacen: z.string().optional(),
  serialNumber: z.string().optional(),
});

type ArticleFilterSchemaType = z.infer<typeof articleFilterSchema>;

type ArticleFilterInputType = z.input<typeof articleFilterSchema>;

const articleFilterDefaultValues: ArticleFilterInputType = {
  name: '',
  description: '',
  barcode: '',
  multiple: '',
  factor: '',
  almacen: '',
  serialNumber: '',
};

const articleUpdateSchema = z
  .object({
    productId: z.number(),
    articleId: z.number(),
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(255),
    barcode: z.string().min(1).max(255),
    multiple: z.string().min(1).max(255),
    almacen: z.string().optional(),
    factor: z.number().int().min(1).max(255),
  })
  .superRefine((data, ctx) => {
    if (data.multiple === 'UNIDAD' && data.factor !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be 1 for UNIDAD',
        path: ['factor'],
      });
    }
    if (data.multiple !== 'UNIDAD' && data.factor === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be different than 1 for PAQUETE, CAJA, OTRO',
        path: ['factor'],
      });
    }
  });

type ArticleUpdateSchemaType = z.infer<typeof articleUpdateSchema>;

type ArticleUpdateInputType = z.input<typeof articleUpdateSchema>;

const articleUpdateDefaultValues: ArticleUpdateInputType = {
  productId: 0,
  articleId: 0,
  name: '',
  description: '',
  barcode: '',
  multiple: '',
  almacen: '',
  factor: 0,
};

const articleCreateSchema = z
  .object({
    productId: z.union([z.number(), z.literal('')]).optional(),
    name: z.string().min(1).max(255),
    description: z.string().min(1).max(255),

    barcode: z.string().min(1).max(255),
    multiple: z.string().min(1).max(255),
    factor: z.number().int().min(1).max(255),
    almacen: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.multiple === 'UNIDAD' && data.factor !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be 1 for UNIDAD',
        path: ['factor'],
      });
    }
    if (data.multiple !== 'UNIDAD' && data.factor === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be different than 1 for PAQUETE, CAJA, OTRO',
        path: ['factor'],
      });
    }
  });

type ArticleCreateSchemaType = z.infer<typeof articleCreateSchema>;

type ArticleCreateInputType = z.input<typeof articleCreateSchema>;

const articleCreateDefaultValues: ArticleCreateInputType = {
  productId: '',
  name: '',

  description: '',
  barcode: '',
  multiple: '',
  factor: 0,
  almacen: '',
};
