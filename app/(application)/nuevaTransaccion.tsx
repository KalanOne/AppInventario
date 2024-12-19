import { useState } from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { Keyboard, ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  DataTable,
  Divider,
  IconButton,
  Text,
  TextInput,
} from 'react-native-paper';
import { z } from 'zod';

import { Flex } from '@/components/Flex';
import { CDropdownInput } from '@/components/form/CDropdownInput';
import { CreateModal } from '@/components/form/CreateModal';
import { CTextInput } from '@/components/form/CTextInput';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner } from '@/components/scanner/Scanner';
import { ArticlesSearch } from '@/components/Searchs/ArticlesSearch';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { Product } from '@/types/searchs';
import { zodResolver } from '@hookform/resolvers/zod';

export default function NuevaTransaccionScreen() {
  const color = useAppTheme();
  const [unitAddVisible, setUnitAddVisible] = useState(false);
  const [productSearch, setProductSearch] = useState<{
    modal: boolean;
    origin: 'update' | 'add' | null;
  }>({ modal: false, origin: null });
  const [articleSearch, setArticleSearch] = useState<{
    modal: boolean;
    origin: 'update' | 'add' | null;
  }>({ modal: false, origin: null });
  const [barcodeScan, setBarcodeScan] = useState<{
    modal: boolean;
    origin: 'update' | 'add' | null;
    input: 'barcode' | 'serial' | null;
  }>({
    modal: false,
    origin: null,
    input: null,
  });

  const transactionCreateForm = useForm<
    TransactionCreateInputType,
    unknown,
    TransactionCreateSchemaType
  >({
    defaultValues: transactionCreateDefaultValues,
    resolver: zodResolver(transactionCreateSchema),
  });

  const transactionCreateArrayForm = useFieldArray({
    control: transactionCreateForm.control,
    name: 'unit',
  });

  const transactionUnitCreateForm = useForm<
    TransactionUnitInputType,
    unknown,
    TransactionUnitSchemaType
  >({
    defaultValues: transactionUnitDefaultValues,
    resolver: zodResolver(transactionUnitSchema),
  });

  const [type, unit] = useWatch({
    control: transactionCreateForm.control,
    name: ['type', 'unit'],
  });

  function addUnitPress() {
    setUnitAddVisible(true);
  }

  function addUnit(data: TransactionUnitInputType) {
    transactionCreateArrayForm.append(data);
    transactionUnitCreateForm.reset();
    setUnitAddVisible(false);
  }

  function removeUnit(unitDelete: TransactionUnitInputType, index: number) {
    const unitLength = unit.length;
    const filteredUnit = unit.filter((item) => item != unitDelete);
    const unitLengthFiltered = filteredUnit.length;

    if (unitLength - 1 === unitLengthFiltered) {
      transactionCreateForm.setValue(
        'unit',
        unit.filter((item) => item != unitDelete)
      );
    } else {
      if (unit[index] == unitDelete) {
        transactionCreateArrayForm.remove(index);
      }
    }
  }

  function handleSearchProductCreatePress() {
    setProductSearch({ modal: true, origin: 'add' });
    Keyboard.dismiss();
  }

  function handleFoundProduct(product: Product) {
    switch (productSearch.origin) {
      case 'add':
        transactionUnitCreateForm.setValue('productId', product.id);
        transactionUnitCreateForm.setValue('name', product.name);
        transactionUnitCreateForm.setValue(
          'description',
          product.description || ''
        );
        break;

      case 'update':
        // articleUpdateForm.setValue('productId', product.id);
        // articleUpdateForm.setValue('name', product.name);
        // articleUpdateForm.setValue('description', product.description || '');
        break;

      default:
        break;
    }
    setProductSearch((prev) => ({ ...prev, modal: false }));
  }

  function handleSearchArticleCreatePress() {
    setArticleSearch({ modal: true, origin: 'add' });
  }

  function handleFoundArticle(article: any) {
    switch (articleSearch.origin) {
      case 'add':
        transactionUnitCreateForm.setValue('articleId', article.id);
        transactionUnitCreateForm.setValue('barcode', article.barcode);
        transactionUnitCreateForm.setValue('multiple', article.multiple);
        transactionUnitCreateForm.setValue('factor', article.factor);
        transactionUnitCreateForm.setValue('name', article.product.name);
        transactionUnitCreateForm.setValue(
          'description',
          article.product.description || ''
        );
        transactionUnitCreateForm.setValue('productId', article.product.id);
        transactionUnitCreateForm.setValue('name', article.product.name);
        break;
      default:
        break;
    }
    setArticleSearch((prev) => ({ ...prev, modal: false }));
  }

  function handleBarcodeScanClick(
    origin: 'add' | 'update',
    input: 'barcode' | 'serial'
  ) {
    setBarcodeScan({ modal: true, origin, input });
  }

  function handleBarcodeScan(barcode: string) {
    if (barcodeScan.origin === 'add') {
      if (barcodeScan.input === 'barcode') {
        transactionUnitCreateForm.setValue('barcode', barcode);
      } else if (barcodeScan.input === 'serial') {
        transactionUnitCreateForm.setValue('serial', barcode);
      }
    }
    setBarcodeScan((prev) => ({ ...prev, modal: false }));
  }

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <FormProvider {...transactionCreateForm}>
        <Flex padding={10}>
          <CDropdownInput
            name="type"
            label="Tipo de transacción"
            data={[
              { key: 'income', value: 'Ingreso' },
              { key: 'expense', value: 'Egreso' },
            ]}
            labelField={'value'}
            valueField={'key'}
          />
          <CTextInput
            label={type == 'income' ? 'Emisor' : 'Receptor'}
            name="emitter"
          />
          <Flex direction="row">
            <Text
              style={{
                flex: 1,
                marginTop: 10,
                textAlign: 'center',
              }}
              variant="titleMedium"
            >
              {type == 'income'
                ? 'Productos a ingresar'
                : 'Productos a egresar'}
            </Text>
            <IconButton
              icon="plus"
              mode="contained"
              onPress={addUnitPress}
              style={{ marginTop: 10 }}
            />
          </Flex>
          <DataTable style={{ height: '60%' }}>
            <DataTable.Header>
              <DataTable.Title style={styles.columLong}>
                Product name
              </DataTable.Title>
              <DataTable.Title style={styles.columnMid}>
                Multiple
              </DataTable.Title>
              <DataTable.Title style={styles.columnShort} numeric>
                Quantity
              </DataTable.Title>
              <DataTable.Title
                style={[styles.columnShort, { alignItems: 'center' }]}
              >
                Actions
              </DataTable.Title>
            </DataTable.Header>
            <ScrollView style={styles.scrollView}>
              {unit.length > 0 &&
                unit.map((item, index) => (
                  <DataTable.Row
                    key={index}
                    // onPress={() => {
                    //   handleRowPress(item);
                    // }}
                  >
                    <DataTable.Cell style={styles.columLong}>
                      {item.name}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnMid}>
                      {item.multiple} - {item.factor}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnShort} numeric>
                      {item.quantity}
                    </DataTable.Cell>
                    <DataTable.Cell
                      style={[
                        styles.columnShort,
                        {
                          justifyContent: 'center',
                          alignItems: 'center',
                        },
                      ]}
                      numeric
                    >
                      <IconButton
                        icon={'delete'}
                        onPress={() => removeUnit(item, index)}
                        mode="contained"
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              {!unit.length && (
                <DataTable.Row>
                  <DataTable.Cell centered style={styles.columnNoData}>
                    No data
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </ScrollView>
          </DataTable>
          <Flex direction="row" justify="center">
            <Button
              onPress={transactionCreateForm.handleSubmit((data) => {
                console.log(data);
              })}
              mode="contained"
              style={{ marginTop: 10 }}
              disabled={!transactionCreateForm.formState.isValid}
            >
              Crear transacción
            </Button>
          </Flex>
        </Flex>
      </FormProvider>
      <CreateModal
        form={transactionUnitCreateForm}
        visible={unitAddVisible}
        handleCreateDismiss={() => {
          setUnitAddVisible(false);
        }}
        handleCreateApply={transactionUnitCreateForm.handleSubmit(addUnit)}
        handleCreateCancel={() => {
          transactionUnitCreateForm.reset();
          setUnitAddVisible(false);
        }}
        handleCreateReset={() => {
          transactionUnitCreateForm.reset();
        }}
      >
        <Text>Producto</Text>
        <CTextInput
          name="productId"
          label="Product Id"
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

        <Divider style={{ marginVertical: 5 }} bold />

        <Text>Artículo</Text>
        <CTextInput
          label="Article ID"
          name="articleId"
          helperText={
            'Si no se selecciona un articulo, se creará uno nuevo (<=0 o vacio)'
          }
          type="number"
          keyboardType="numeric"
          right={
            <TextInput.Icon
              icon="magnify"
              onPress={handleSearchArticleCreatePress}
              mode="contained"
            />
          }
        />
        <CTextInput
          name="barcode"
          label="Barcode"
          flexStyles={{ flex: 1 }}
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('add', 'barcode')}
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
          label="Serial"
          name="serial"
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('add', 'serial')}
              mode="contained"
            />
          }
        />
        <CTextInput
          label="Quantity"
          name="quantity"
          type="number"
          keyboardType="numeric"
        />
      </CreateModal>
      <ProductsSearch
        visible={productSearch.modal}
        handleSearchDismissCancel={() =>
          setProductSearch((prev) => ({ ...prev, modal: false }))
        }
        handleFoundProduct={handleFoundProduct}
      />
      <ArticlesSearch
        visible={articleSearch.modal}
        handleSearchDismissCancel={() => {
          setArticleSearch((prev) => ({ ...prev, modal: false }));
        }}
        handleFoundArticle={handleFoundArticle}
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

const transactionUnitSchema = z.object({
  productId: z.union([z.number(), z.literal('')]).optional(),
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(255),

  articleId: z.union([z.number(), z.literal('')]).optional(),
  barcode: z.string().min(1).max(255),
  multiple: z.string().min(1).max(255),
  factor: z
    .union([z.number().min(1).max(255), z.literal('')])
    .refine((val) => val !== '', {
      message: 'Factor cannot be empty',
    }),

  serial: z.string().optional(),
  quantity: z
    .union([z.number().int().positive().min(1), z.literal('')])
    .refine((val) => val !== '', {
      message: 'Quantity cannot be empty',
    }),
});

type TransactionUnitSchemaType = z.infer<typeof transactionUnitSchema>;

type TransactionUnitInputType = z.input<typeof transactionUnitSchema>;

const transactionUnitDefaultValues: TransactionUnitInputType = {
  productId: '',
  name: '',
  description: '',
  articleId: '',
  barcode: '',
  multiple: '',
  factor: '',
  serial: '',
  quantity: '',
};

const transactionCreateSchema = z.object({
  type: z
    .union([z.enum(['income', 'expense']), z.literal('')])
    .refine((val) => val !== '', {
      message: 'Type cannot be empty',
    }),
  emitter: z.string().min(1).max(255),
  unit: z.array(transactionUnitSchema).min(1),
});

type TransactionCreateSchemaType = z.infer<typeof transactionCreateSchema>;

type TransactionCreateInputType = z.input<typeof transactionCreateSchema>;

const transactionCreateDefaultValues: TransactionCreateInputType = {
  type: '',
  emitter: '',
  unit: [],
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  columLong: {
    flex: 3,
  },
  columnMid: {
    flex: 2,
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
