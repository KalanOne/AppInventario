import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Checkbox,
  DataTable,
  Divider,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { getTransaction } from '@/api/transacciones.api';
import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { TransactionsSearch } from '@/components/Searchs/TransactionsSearch';
import { useProgressQuery } from '@/hooks/progress';
import { TransactionSearch } from '@/types/searchs';
import { TransactionDetail } from '@/types/transacciones';
import { format } from '@formkit/tempo';
import { useQuery } from '@tanstack/react-query';

export default function Transacciones() {
  const color = useAppTheme();
  const [trasactionSelected, setTrasactionSelected] = useState<{
    visible: boolean;
    selected: TransactionSearch | null;
  }>({ visible: false, selected: null });
  const [trasactionDetailSelected, setTrasactionDetailSelected] = useState<{
    visible: boolean;
    selected: TransactionDetail | null;
  }>({ visible: false, selected: null });

  const tranasctionQuery = useQuery({
    queryKey: ['tranasctionQuery', `${trasactionSelected.selected?.id}`],
    queryFn: async () => {
      if (!trasactionSelected.selected) {
        return null;
      }
      return getTransaction(trasactionSelected.selected.id);
    },
    enabled: !!trasactionSelected.selected,
  });
  useProgressQuery(tranasctionQuery, 'tranasctionQuery');
  const transaction = tranasctionQuery.data;

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
          }}
        >
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
