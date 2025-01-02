import { SetStateAction, useCallback, useState } from 'react';
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
  Dialog,
  Divider,
  IconButton,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { z } from 'zod';

import { createTransactions } from '@/api/transacciones.api';
import { Flex } from '@/components/Flex';
import { CCheckBox } from '@/components/form/CCheckBox';
import { CDropdownInput } from '@/components/form/CDropdownInput';
import { CreateModal } from '@/components/form/CreateModal';
import { CTextInput } from '@/components/form/CTextInput';
import { UpdateModal } from '@/components/form/UpdateModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner } from '@/components/scanner/Scanner';
import { ArticlesSearch } from '@/components/Searchs/ArticlesSearch';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { useCrudMutationF } from '@/hooks/crud';
import { useProgressStore } from '@/stores/progress';
import { Product } from '@/types/searchs';
import { TransactionCreate } from '@/types/transacciones';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDate } from 'react-native-paper-dates/lib/typescript/Date/Calendar';
import { useQueryClient } from '@tanstack/react-query';
import { deleteEmptyProperties } from '@/utils/other';

export default function NuevaTransaccionScreen() {
  const color = useAppTheme();
  const [unitAddVisible, setUnitAddVisible] = useState(false);
  const [unitUpdate, setUnitUpdate] = useState<{
    modal: boolean;
    index: number;
    item: TransactionUnitInputType;
  }>({ modal: false, index: 0, item: transactionUnitDefaultValues });
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
  const addProgress = useProgressStore((state) => state.addProgress);
  const removeProgress = useProgressStore((state) => state.removeProgress);
  const [localNotification, setLocalNotification] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: '' });
  const [confirmDialog, setConfirmDialog] = useState<{
    visible: boolean;
    data: TransactionCreateInputType;
  }>({
    visible: false,
    data: transactionCreateDefaultValues,
  });
  const [date, setDate] = useState<CalendarDate>(new Date());
  const [dateVisible, setDateVisible] = useState(false);
  const queryClient = useQueryClient();

  const onDismissSingle = useCallback(() => {
    setDateVisible(false);
  }, [setDateVisible]);

  const onConfirmSingle = useCallback(
    (params: { date: CalendarDate }) => {
      setDateVisible(false);
      setDate(params.date);
    },
    [setDateVisible, setDate]
  );

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
    name: 'units',
  });

  const transactionUnitCreateForm = useForm<
    TransactionUnitInputType,
    unknown,
    TransactionUnitSchemaType
  >({
    defaultValues: transactionUnitDefaultValues,
    resolver: zodResolver(transactionUnitSchema),
  });

  const transactionUnitUpdateForm = useForm<
    TransactionUnitInputType,
    unknown,
    TransactionUnitSchemaType
  >({
    defaultValues: transactionUnitDefaultValues,
    resolver: zodResolver(transactionUnitSchema),
  });

  const [type, units] = useWatch({
    control: transactionCreateForm.control,
    name: ['type', 'units'],
  });

  const transactionCreateMutation = useCrudMutationF(
    createTransactions,
    '',
    'create',
    {
      onSuccess: async () => {
        transactionCreateForm.reset(transactionCreateDefaultValues);
        transactionCreateArrayForm.replace([]);
        await queryClient.invalidateQueries({ queryKey: ['articlesSearch'] });
        await queryClient.invalidateQueries({ queryKey: ['productsSearch'] });
      },
      onError(error) {
        if (
          error.response?.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data
        ) {
          setLocalNotification({
            visible: true,
            message: `${error.response.data.message}`,
          });
        } else {
          setLocalNotification({
            visible: true,
            message: 'An error occurred while creating the transaction',
          });
        }
      },
    }
  );

  function addUnitPress() {
    setUnitAddVisible(true);
  }

  function addUnit(data: TransactionUnitInputType) {
    addProgress('addUnit');
    data = deleteEmptyProperties(data);
    const existingUnitIndex = units.findIndex(
      (unit) => unit.barcode === data.barcode && data.serial == unit.serial
      // &&
      // unit.productId === data.productId &&
      // unit.articleId === data.articleId &&
      // unit.serial === data.serial &&
      // unit.factor === data.factor &&
      // unit.multiple === data.multiple
    );

    if (existingUnitIndex !== -1) {
      if (data.serial) {
        setLocalNotification({
          visible: true,
          message: 'Serial has been added to the transaction before',
        });
        removeProgress('addUnit');
        return;
      }
      const existingUnit = units[existingUnitIndex];
      const updatedUnit = {
        ...existingUnit,
        quantity: Number(existingUnit.quantity) + Number(data.quantity),
      };
      transactionCreateArrayForm.update(existingUnitIndex, updatedUnit);
    } else {
      transactionCreateArrayForm.append(data);
    }
    transactionUnitCreateForm.reset();
    setUnitAddVisible(false);
    removeProgress('addUnit');
  }

  function removeUnit(unitDelete: TransactionUnitInputType, index: number) {
    addProgress('removeUnit');
    const unitLength = units.length;
    const filteredUnit = units.filter((item) => item != unitDelete);
    const unitLengthFiltered = filteredUnit.length;

    if (unitLength - 1 === unitLengthFiltered) {
      transactionCreateForm.setValue(
        'units',
        units.filter((item) => item != unitDelete)
      );
    } else {
      if (units[index] == unitDelete) {
        transactionCreateArrayForm.remove(index);
      }
    }
    removeProgress('removeUnit');
  }

  function handleSearchProductPress(origin: 'add' | 'update') {
    setProductSearch({ modal: true, origin });
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
        transactionUnitUpdateForm.setValue('productId', product.id);
        transactionUnitUpdateForm.setValue('name', product.name);
        transactionUnitUpdateForm.setValue(
          'description',
          product.description || ''
        );
        break;

      default:
        break;
    }
    setProductSearch((prev) => ({ ...prev, modal: false }));
  }

  function handleSearchArticlePress(origin: 'add' | 'update') {
    setArticleSearch({ modal: true, origin });
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
      case 'update':
        transactionUnitUpdateForm.setValue('articleId', article.id);
        transactionUnitUpdateForm.setValue('barcode', article.barcode);
        transactionUnitUpdateForm.setValue('multiple', article.multiple);
        transactionUnitUpdateForm.setValue('factor', article.factor);
        transactionUnitUpdateForm.setValue('name', article.product.name);
        transactionUnitUpdateForm.setValue(
          'description',
          article.product.description || ''
        );
        transactionUnitUpdateForm.setValue('productId', article.product.id);
        transactionUnitUpdateForm.setValue('name', article.product.name);
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
        transactionUnitCreateForm.setValue('quantity', 1);
      }
    } else if (barcodeScan.origin === 'update') {
      if (barcodeScan.input === 'barcode') {
        transactionUnitUpdateForm.setValue('barcode', barcode);
      } else if (barcodeScan.input === 'serial') {
        transactionUnitUpdateForm.setValue('serial', barcode);
        transactionUnitUpdateForm.setValue('quantity', 1);
      }
    }
    setBarcodeScan((prev) => ({ ...prev, modal: false }));
  }

  function handleRowPress(item: TransactionUnitInputType, index: number) {
    transactionUnitUpdateForm.reset(item);
    setUnitUpdate({
      modal: true,
      index,
      item,
    });
  }

  function updateUnit(data: TransactionUnitInputType) {
    data = deleteEmptyProperties(data);
    addProgress('updateUnit');
    const unitsFiltered = units.filter((item) => item != unitUpdate.item);

    const existingUnitIndex = unitsFiltered.findIndex(
      (unit) => unit.barcode === data.barcode && data.serial == unit.serial
      // &&
      //   unit.productId === data.productId &&
      //   unit.articleId === data.articleId &&
      //   unit.serial === data.serial &&
      //   unit.factor === data.factor &&
      //   unit.multiple === data.multiple
    );

    if (existingUnitIndex !== -1) {
      if (data.serial) {
        setLocalNotification({
          visible: true,
          message: 'Serial has been added to the transaction before',
        });
        removeProgress('updateUnit');
        return;
      }

      const existingUnit = unitsFiltered[existingUnitIndex];
      const updatedUnit = {
        ...existingUnit,
        quantity: Number(existingUnit.quantity) + Number(data.quantity),
      };
      unitsFiltered[existingUnitIndex] = updatedUnit;
      transactionCreateForm.setValue('units', unitsFiltered);
    } else {
      unitsFiltered.push(data);
      transactionCreateForm.setValue('units', unitsFiltered);
    }
    setUnitUpdate({
      modal: false,
      index: 0,
      item: transactionUnitDefaultValues,
    });
    removeProgress('updateUnit');
  }

  function handleSendTransaction(data: TransactionCreateInputType) {
    transactionCreateMutation.mutate({
      data: {
        ...(data as TransactionCreate),
        transactionDate: date?.toISOString() || '',
      },
      extras: undefined,
    });
  }

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      {/* Main Content - Table, Form */}
      <FormProvider {...transactionCreateForm}>
        <Flex
          style={{
            paddingTop: 10,
            paddingRight: 10,
            paddingBottom: 0,
            paddingLeft: 10,
          }}
          flex={1}
        >
          <TextInput
            value={date ? `${date.toLocaleDateString()}` : ''}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setDateVisible(true)}
              />
            }
          />
          <DatePickerModal
            locale="es"
            mode="single"
            visible={dateVisible}
            onDismiss={onDismissSingle}
            date={date}
            onConfirm={onConfirmSingle}
          />
          <CDropdownInput
            name="type"
            label="Tipo de transacción"
            data={[
              { key: 'ENTRY', value: 'Ingreso' },
              { key: 'EXIT', value: 'Egreso' },
            ]}
            labelField={'value'}
            valueField={'key'}
          />
          <CTextInput
            label={type == 'ENTRY' ? 'Emisor' : 'Receptor'}
            name="emitter"
          />
          <CTextInput label={'Folio'} name="folio" />
          <Flex direction="row">
            <IconButton
              icon="plus"
              mode="contained"
              onPress={addUnitPress}
              style={{ marginTop: 10 }}
            />
            <Text
              style={{
                flex: 1,
                marginTop: 10,
                textAlign: 'center',
              }}
              variant="titleMedium"
            >
              {type == 'ENTRY' ? 'Productos a ingresar' : 'Productos a egresar'}
            </Text>
            <IconButton
              icon="send"
              mode="contained"
              onPress={transactionCreateForm.handleSubmit((data) => {
                setConfirmDialog({ visible: true, data });
              })}
              style={{ marginTop: 10 }}
              disabled={!transactionCreateForm.formState.isValid}
            />
          </Flex>
          <DataTable
            style={{
              flex: 1,
              // Lo siguiente es para que tome el 100% del ancho
              marginHorizontal: -10,
              width: '110%',
            }}
          >
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
                style={[styles.columnShort, { justifyContent: 'center' }]}
              >
                Actions
              </DataTable.Title>
            </DataTable.Header>
            <ScrollView style={styles.scrollView}>
              {units.length > 0 &&
                units.map((item, index) => (
                  <DataTable.Row
                    key={index}
                    onPress={() => {
                      handleRowPress(item, index);
                    }}
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
                      style={[styles.columnShort, { justifyContent: 'center' }]}
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
              {!units.length && (
                <DataTable.Row>
                  <DataTable.Cell centered style={styles.columnNoData}>
                    No data
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </ScrollView>
          </DataTable>
        </Flex>
      </FormProvider>
      {/* Create Modal */}
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
              onPress={() => handleSearchProductPress('add')}
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
              onPress={() => {
                handleSearchArticlePress('add');
              }}
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

        <Divider style={{ marginVertical: 5 }} bold />
        <Text>Unidad</Text>

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
        <CCheckBox
          name="afectation"
          label="Afecta a inventrario"
          helperText="Si la cantidad afecta al inventario o no"
        />
      </CreateModal>
      {/* Update Modal */}
      <UpdateModal
        form={transactionUnitUpdateForm}
        visible={unitUpdate.modal}
        handleUpdateDismiss={() => {
          setUnitUpdate((prev) => ({ ...prev, modal: false }));
        }}
        handleUpdateApply={transactionUnitUpdateForm.handleSubmit(updateUnit)}
        handleUpdateCancel={() => {
          transactionUnitUpdateForm.reset(transactionUnitDefaultValues);
          setUnitUpdate((prev) => ({ ...prev, modal: false }));
        }}
        handleUpdateReset={() => {
          transactionUnitUpdateForm.reset(unitUpdate.item);
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
              onPress={() => handleSearchProductPress('update')}
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
              onPress={() => {
                handleSearchArticlePress('update');
              }}
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
              onPress={() => handleBarcodeScanClick('update', 'barcode')}
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

        <Divider style={{ marginVertical: 5 }} bold />
        <Text>Unidad</Text>

        <CTextInput
          label="Serial"
          name="serial"
          right={
            <TextInput.Icon
              icon="barcode-scan"
              onPress={() => handleBarcodeScanClick('update', 'serial')}
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
        <CCheckBox
          name="afectation"
          label="Afecta a inventrario"
          helperText="Si la cantidad afecta al inventario o no"
        />
      </UpdateModal>
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
      <Portal>
        <Dialog
          visible={localNotification.visible}
          onDismiss={() => {
            setLocalNotification((prev) => ({ ...prev, visible: false }));
          }}
        >
          <Dialog.Title>Alert</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{localNotification.message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setLocalNotification((prev) => ({ ...prev, visible: false }));
              }}
            >
              Ok
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <Portal>
        <Dialog
          visible={confirmDialog.visible}
          onDismiss={() => {
            setConfirmDialog((prev) => ({ ...prev, visible: false }));
          }}
        >
          <Dialog.Content>
            <Text>¿Seguro que quieres enviar la transacción?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                setConfirmDialog((prev) => ({ ...prev, visible: false }));
              }}
            >
              Cancelar
            </Button>
            <Button
              onPress={() => {
                handleSendTransaction(confirmDialog.data);
                setConfirmDialog((prev) => ({ ...prev, visible: false }));
              }}
            >
              Enviar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Flex>
  );
}

const transactionUnitSchema = z
  .object({
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
    afectation: z.boolean(),
  })
  .superRefine((val, ctx) => {
    if (val.serial && val.quantity != 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Serial must be empty when quantity is not 1 or quantity must be 1 when serial is not empty',
        path: ['serial'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Serial must be empty when quantity is not 1 or quantity must be 1 when serial is not empty',
        path: ['quantity'],
      });
    }
    if (
      val.serial &&
      (val.factor != 1 || val.multiple.toLowerCase() != 'unidad')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Serial must be empty when factor is not 1 and multiple is not "unidad" or factor must be 1 and multiple must be "unidad when serial is not empty',
        path: ['serial'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Serial must be empty when factor is not 1 and multiple is not "unidad" or factor must be 1 and multiple must be "unidad when serial is not empty',
        path: ['factor'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Serial must be empty when factor is not 1 and multiple is not "unidad" or factor must be 1 and multiple must be "unidad when serial is not empty',
        path: ['multiple'],
      });
    }
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
  afectation: true,
};

const transactionCreateSchema = z.object({
  type: z
    .union([z.enum(['ENTRY', 'EXIT']), z.literal('')])
    .refine((val) => val !== '', {
      message: 'Type cannot be empty',
    }),
  emitter: z.string().min(1).max(255),
  folio: z.string().min(1).max(255),
  units: z.array(transactionUnitSchema).min(1),
});

type TransactionCreateSchemaType = z.infer<typeof transactionCreateSchema>;

type TransactionCreateInputType = z.input<typeof transactionCreateSchema>;

const transactionCreateDefaultValues: TransactionCreateInputType = {
  type: '',
  emitter: '',
  folio: '',
  units: [],
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  columLong: {
    // flex: 3,
    flex: 4,
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
