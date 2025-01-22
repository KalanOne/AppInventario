import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Checkbox,
  DataTable,
  Divider,
  IconButton,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { getTransaction, getTransactionReport } from '@/api/transacciones.api';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { TransactionsSearch } from '@/components/Searchs/TransactionsSearch';
import { ListItem } from '@/components/UI/CollapsableListItem';
import { Flex } from '@/components/UI/Flex';
import { useCommonMutation } from '@/hooks/commonQuery';
import { useProgressQuery } from '@/hooks/progress';
import { useNotification } from '@/stores/notificationStore';
import { TransactionSearch } from '@/types/searchs';
import { TransactionDetail } from '@/types/transacciones';
import { blobToBase64 } from '@/utils/other';
import { format } from '@formkit/tempo';
import { useQuery } from '@tanstack/react-query';

export default function Transacciones() {
  const color = useAppTheme();
  const [trasactionSelected, setTrasactionSelected] = useState<{
    visible: boolean;
    selected: TransactionSearch | number | null;
  }>({ visible: false, selected: null });
  const [trasactionDetailSelected, setTrasactionDetailSelected] = useState<{
    visible: boolean;
    selected: TransactionDetail | null;
  }>({ visible: false, selected: null });
  const addNotification = useNotification((state) => state.addNotification);
  const [actionPdf, setActionPdf] = useState<'share' | 'print' | 'save'>(
    'print'
  );

  const { id } = useLocalSearchParams();

  const transctionQuery = useQuery({
    queryKey: [
      'transctionQuery',
      `${typeof trasactionSelected.selected == 'number' ? trasactionSelected.selected : trasactionSelected.selected?.id}`,
    ],
    queryFn: async () => {
      if (!trasactionSelected.selected) {
        return null;
      }
      return getTransaction(
        typeof trasactionSelected.selected == 'number'
          ? trasactionSelected.selected
          : trasactionSelected.selected.id
      );
    },
    enabled: !!trasactionSelected.selected,
  });
  useProgressQuery(transctionQuery, 'transctionQuery');
  const transaction = transctionQuery.data;

  const transactionReportMutation = useCommonMutation(
    getTransactionReport,
    '',
    {
      onSuccess: async (response) => {
        try {
          const base64Data = await blobToBase64(response);
          if (actionPdf === 'print') {
            await Print.printAsync({
              uri: `data:application/pdf;base64,${base64Data}`,
            });
          } else if (actionPdf === 'share') {
            const fileUri = `${FileSystem.cacheDirectory}acuse_reporte_${transaction?.folio_number.replace(/[\/\\]/g, '_')}.pdf`;
            await FileSystem.writeAsStringAsync(fileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Compartir acuse',
              UTI: 'com.adobe.pdf',
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
              `acuse_reporte_${transaction?.folio_number.replace(/[\/\\]/g, '_')}`,
              'application/pdf'
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
    }
  );

  function printReport() {
    if (transaction) {
      setActionPdf('print');
      transactionReportMutation.mutate(transaction.id);
    } else {
      addNotification({
        message: 'No se ha seleccionado ninguna transacción',
        code: '404',
      });
    }
  }

  function shareReport() {
    if (transaction) {
      setActionPdf('share');
      transactionReportMutation.mutate(transaction.id);
    } else {
      addNotification({
        message: 'No se ha seleccionado ninguna transacción',
        code: '404',
      });
    }
  }

  function saveReport() {
    if (transaction) {
      setActionPdf('save');
      transactionReportMutation.mutate(transaction.id);
    } else {
      addNotification({
        message: 'No se ha seleccionado ninguna transacción',
        code: '404',
      });
    }
  }

  const modalStyles = StyleSheet.create({
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      padding: 10,
      margin: 10,
      borderRadius: 10,
      elevation: 5,
      flex: 0.8,
    },
    title: {
      marginBottom: 10,
      // marginLeft: 10,
    },
    button: {
      // margin: 5,
    },
    buttonsContainer: {
      // marginVertical: 10,
      width: '100%',
      // paddingHorizontal: 10,
    },
  });

  useEffect(() => {
    if (id) {
      setTrasactionSelected((prev) => ({
        ...prev,
        selected: Number(id),
        visible: false,
      }));
    }
  }, [id]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Flex align="center" justify="center" padding={10}>
        <Button
          mode="contained"
          onPress={() => {
            setTrasactionSelected((prev) => ({ ...prev, visible: true }));
          }}
        >
          Selecciona una transacción
        </Button>
      </Flex>
      {transaction ? (
        <Flex
          flex={1}
          style={{
            paddingTop: 10,
            paddingRight: 10,
            paddingBottom: 0,
            paddingLeft: 10,
            flexGrow: 1,
          }}
        >
          <ListItem
            title="Transacción"
            subtitle={`Folio: ${transaction.folio_number}`}
            icon="receipt"
          >
            <Flex style={{ width: '100%', flexGrow: 1, padding: 10 }}>
              <TextInput
                value={format({
                  date: transaction.transaction_date,
                  format: 'full',
                  locale: 'es',
                })}
                label={'Fecha de la transacción'}
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
              <TextInput
                value={format({
                  date: transaction.createdAt,
                  format: 'full',
                  locale: 'es',
                })}
                label={'Fecha de creación de la transacción'}
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
              <TextInput
                label={'Tipo de transacción'}
                value={
                  transaction.transaction_type == 'ENTRY' ? 'Entrada' : 'Salida'
                }
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
              <TextInput
                label={'Folio'}
                value={transaction.folio_number}
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
              <TextInput
                label={
                  transaction.transaction_type == 'ENTRY'
                    ? 'Receptor'
                    : 'Emisor'
                }
                value={`${transaction.user.first_name} ${transaction.user.last_name}`}
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
              <TextInput
                label={
                  transaction.transaction_type == 'EXIT' ? 'Receptor' : 'Emisor'
                }
                value={transaction.person_name}
                mode="outlined"
                style={{ marginVertical: 3 }}
              />
            </Flex>
          </ListItem>

          <Flex direction="row" justify="flex-end" padding={10}>
            <IconButton
              icon={'printer-wireless'}
              mode="contained"
              onPress={printReport}
            />
            <IconButton
              icon={'share-variant'}
              mode="contained"
              onPress={shareReport}
            />
            <IconButton
              icon={'content-save'}
              mode="contained"
              onPress={saveReport}
            />
          </Flex>

          <DataTable
            style={{
              flex: 1,
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
            </DataTable.Header>
            <ScrollView style={styles.scrollView}>
              {transaction.transactionDetails.length > 0 &&
                transaction.transactionDetails.map((item, index) => (
                  <DataTable.Row
                    key={index}
                    onPress={() => {
                      setTrasactionDetailSelected({
                        visible: true,
                        selected: item,
                      });
                    }}
                  >
                    <DataTable.Cell style={styles.columLong}>
                      {item.article.product.name}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnMid}>
                      {item.article.multiple} - {item.article.factor}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnShort} numeric>
                      {item.quantity}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              {!transaction.transactionDetails.length && (
                <DataTable.Row>
                  <DataTable.Cell centered style={styles.columnNoData}>
                    No data
                  </DataTable.Cell>
                </DataTable.Row>
              )}
            </ScrollView>
          </DataTable>
        </Flex>
      ) : (
        <></>
      )}
      <TransactionsSearch
        visible={trasactionSelected.visible}
        handleSearchDismissCancel={() => {
          setTrasactionSelected((prev) => ({ ...prev, visible: false }));
        }}
        handleFoundTransaction={(transaction) => {
          setTrasactionSelected({ visible: false, selected: transaction });
        }}
      />
      <Portal>
        <Modal
          visible={trasactionDetailSelected.visible}
          onDismiss={() => {
            setTrasactionDetailSelected({ visible: false, selected: null });
          }}
          contentContainerStyle={modalStyles.containerStyle}
        >
          {trasactionDetailSelected.selected && (
            <Flex flex={1} paddingX={10}>
              <Text variant="titleLarge" style={modalStyles.title}>
                Artículo
              </Text>
              <ScrollView style={{ maxHeight: '100%', marginBottom: 10 }}>
                <Text>Producto</Text>
                <TextInput
                  label="Product ID"
                  value={`${trasactionDetailSelected.selected.article.product.id}`}
                  keyboardType="numeric"
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Name"
                  value={trasactionDetailSelected.selected.article.product.name}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Description"
                  multiline
                  value={
                    trasactionDetailSelected.selected.article.product
                      .description
                  }
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />

                <Divider style={{ marginVertical: 5 }} bold />
                <Text>Artículo</Text>

                <TextInput
                  label="Article ID"
                  keyboardType="numeric"
                  value={`${trasactionDetailSelected.selected.article.id}`}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Barcode"
                  value={trasactionDetailSelected.selected.article.barcode}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Multiple"
                  value={trasactionDetailSelected.selected.article.multiple}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Factor"
                  keyboardType="numeric"
                  value={`${trasactionDetailSelected.selected.article.factor}`}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Almacen"
                  value={
                    trasactionDetailSelected.selected.article.warehouse.name
                  }
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />

                <Divider style={{ marginVertical: 5 }} bold />
                <Text>Unidad</Text>

                <TextInput
                  label="Serial"
                  value={
                    trasactionDetailSelected.selected.serialNumber
                      ? trasactionDetailSelected.selected.serialNumber
                      : ''
                  }
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <TextInput
                  label="Quantity"
                  keyboardType="numeric"
                  value={`${trasactionDetailSelected.selected.quantity}`}
                  style={{ marginVertical: 3 }}
                  mode="outlined"
                />
                <Checkbox.Item
                  label={'Afecta a inventario'}
                  status={
                    Boolean(trasactionDetailSelected.selected.afectation)
                      ? 'checked'
                      : 'unchecked'
                  }
                  style={{
                    // backgroundColor: color.colors.surfaceVariant,
                    marginVertical: 3,
                  }}
                />
              </ScrollView>
            </Flex>
          )}
        </Modal>
      </Portal>
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  columLong: {
    flex: 7,
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
