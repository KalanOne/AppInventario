import * as Print from 'expo-print';
import { SetStateAction, useCallback, useMemo, useState } from 'react';
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
import { CalendarDate } from 'react-native-paper-dates/lib/typescript/Date/Calendar';
import { z } from 'zod';

import {
  createTransactions,
  getTransactionReport,
} from '@/api/transacciones.api';
import { CCheckBox } from '@/components/form/CCheckBox';
import { CDropdownInput } from '@/components/form/CDropdownInput';
import { CreateModal } from '@/components/form/CreateModal';
import { CTextInput } from '@/components/form/CTextInput';
import { UpdateModal } from '@/components/form/UpdateModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Scanner2 } from '@/components/scanner/Scanner2';
import { ArticlesSearch } from '@/components/Searchs/ArticlesSearch';
import { ProductsSearch } from '@/components/Searchs/ProductsSearch';
import { Flex } from '@/components/UI/Flex';
import { useCommonMutation } from '@/hooks/commonQuery';
import { useCrudMutationF } from '@/hooks/crud';
import { useDependencies } from '@/hooks/dependencies';
import { useProgressStore } from '@/stores/progress';
import { Article, Product } from '@/types/searchs';
import { Transaction, TransactionCreate } from '@/types/transacciones';
import { blobToBase64, deleteEmptyProperties } from '@/utils/other';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/stores/notificationStore';

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
  const [print, setPrint] = useState<{
    visible: boolean;
    transaction: Transaction | null;
  }>({ visible: false, transaction: null });
  const addNotification = useNotification((state) => state.addNotification);
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

  const dependencies = useDependencies(['warehouses'], {}, ['warehouses']);

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

  const [multipleCreate] = useWatch({
    control: transactionUnitCreateForm.control,
    name: ['multiple'],
  });

  const transactionFilterForm = useForm<
    TransactionFilterInputType,
    unknown,
    TransactionFilterSchemaType
  >({
    defaultValues: transactionFilterDefaultValues,
    resolver: zodResolver(transactionFilterSchema),
  });

  const transactionUnitUpdateForm = useForm<
    TransactionUnitInputType,
    unknown,
    TransactionUnitSchemaType
  >({
    defaultValues: transactionUnitDefaultValues,
    resolver: zodResolver(transactionUnitSchema),
  });

  const [multipleUpdate] = useWatch({
    control: transactionUnitUpdateForm.control,
    name: ['multiple'],
  });

  const [type, units] = useWatch({
    control: transactionCreateForm.control,
    name: ['type', 'units'],
  });

  const [filter] = useWatch({
    control: transactionFilterForm.control,
    name: ['filter'],
  });

  const filteredUnits = useMemo(
    () =>
      units.filter((unit) => {
        if (!filter) return true;
        return (
          unit.name.toLowerCase().includes(filter.toLowerCase()) ||
          unit.barcode.toLowerCase().includes(filter.toLowerCase()) ||
          (unit.serial &&
            unit.serial.toLowerCase().includes(filter.toLowerCase())) ||
          // (unit.productId &&
          //   unit.productId
          //     .toString()
          //     .toLowerCase()
          //     .includes(filter.toLowerCase())) ||
          // (unit.articleId &&
          //   unit.articleId
          //     .toString()
          //     .toLowerCase()
          //     .includes(filter.toLowerCase())) ||
          unit.description.toLowerCase().includes(filter.toLowerCase()) ||
          unit.multiple.toLowerCase().includes(filter.toLowerCase()) ||
          unit.factor.toString().toLowerCase().includes(filter.toLowerCase()) ||
          unit.quantity.toString().toLowerCase().includes(filter.toLowerCase())
        );
      }),
    [units, filter]
  );

  const transactionCreateMutation = useCrudMutationF(
    createTransactions,
    '',
    'create',
    {
      onSuccess: async (response) => {
        transactionCreateForm.reset(transactionCreateDefaultValues);
        transactionCreateArrayForm.replace([]);
        await queryClient.invalidateQueries({ queryKey: ['articlesSearch'] });
        await queryClient.invalidateQueries({ queryKey: ['productsSearch'] });
        // setLocalNotification({
        //   visible: true,
        //   message: 'Transaction created successfully',
        // });
        setPrint({ visible: true, transaction: response });
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

  const transactionReportMutation = useCommonMutation(
    getTransactionReport,
    '',
    {
      onSuccess: async (response) => {
        try {
          const base64Data = await blobToBase64(response);
          await Print.printAsync({
            uri: `data:application/pdf;base64,${base64Data}`,
          });
        } catch (e) {
          addNotification({
            message: `Error al imprimir el archivo`,
            code: '',
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

  function handleFoundArticle(article: Article) {
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
        transactionUnitCreateForm.setValue('warehouse', article.warehouse.id);
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
        transactionUnitUpdateForm.setValue('warehouse', article.warehouse.id);
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
      <Flex
        style={{
          paddingTop: 10,
          paddingRight: 10,
          paddingBottom: 0,
          paddingLeft: 10,
        }}
        flex={1}
      >
        <FormProvider {...transactionCreateForm}>
          <TextInput
            value={date ? `${date.toLocaleDateString()}` : ''}
            right={
              <TextInput.Icon
                icon="calendar"
                onPress={() => setDateVisible(true)}
              />
            }
            label={'Fecha de la transacción'}
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
              : {units.length}
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
        </FormProvider>
        <FormProvider {...transactionFilterForm}>
          <CTextInput
            label={
              'Buscar producto por nombre, barcode, serial, etc. dentro de la lista'
            }
            name="filter"
            right={
              <TextInput.Icon
                icon={filter ? 'filter' : 'filter-off'}
                onPress={() => transactionFilterForm.setValue('filter', '')}
                mode="contained"
              />
            }
          />
        </FormProvider>
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
            <DataTable.Title style={styles.columnMid}>Multiple</DataTable.Title>
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
            {filteredUnits.length > 0 &&
              filteredUnits.map((item, index) => (
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
            {!filteredUnits.length && (
              <DataTable.Row>
                <DataTable.Cell centered style={styles.columnNoData}>
                  No data
                </DataTable.Cell>
              </DataTable.Row>
            )}
          </ScrollView>
        </DataTable>
      </Flex>
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
          label="Product ID"
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
            !multipleCreate ? '1' : multipleCreate === 'UNIDAD' ? '1' : '12'
          }
        />
        <CDropdownInput
          name="warehouse"
          label="Almacen"
          data={dependencies.warehouses ?? []}
          labelField={'name'}
          valueField={'id'}
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
          label="Product ID"
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
        <CDropdownInput
          name="warehouse"
          label="Almacen"
          data={dependencies.warehouses ?? []}
          labelField={'name'}
          valueField={'id'}
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
      <Scanner2
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
      <Portal>
        <Dialog
          visible={print.visible}
          onDismiss={() => {
            setPrint((prev) => ({ ...prev, visible: false }));
          }}
        >
          <Dialog.Title>¿Desea imprimir el acuse de transacción?</Dialog.Title>
          <Dialog.Content>
            <Text>Se abrirá un archivo PDF con el acuse de transacción</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              onPress={() => {
                transactionReportMutation.mutate(print.transaction?.id);
                setPrint((prev) => ({ ...prev, visible: false }));
              }}
            >
              Si
            </Button>
            <Button
              onPress={() => {
                setPrint((prev) => ({ ...prev, visible: false }));
              }}
            >
              No
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
    warehouse: z
      .union([z.number().min(1), z.null(), z.literal('')])
      .refine((data) => (!data ? false : data > 0), {
        message: 'Warehouse cannot be empty',
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
    if (val.multiple === 'UNIDAD' && val.factor !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be 1 for UNIDAD',
        path: ['factor'],
      });
    }
    if (val.multiple !== 'UNIDAD' && val.factor === 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Factor must be different than 1 for PAQUETE, CAJA, OTRO',
        path: ['factor'],
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
  warehouse: '',
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

const transactionFilterSchema = z.object({
  filter: z.string().optional(),
});

type TransactionFilterSchemaType = z.infer<typeof transactionFilterSchema>;

type TransactionFilterInputType = z.input<typeof transactionFilterSchema>;

const transactionFilterDefaultValues: TransactionFilterInputType = {
  filter: '',
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
