import { getInventory } from '@/api/inventario.api';
import { useProgressQuery } from '@/hooks/progress';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { DataTable, Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { ListItem } from '@/components/UI/CollapsableListItem';
import { format } from '@formkit/tempo';

export default function ProductInventory() {
  const color = useAppTheme();
  const { id } = useLocalSearchParams();
  const productId =
    typeof id === 'string' ? (isNaN(Number(id)) ? null : Number(id)) : null;
  const [page, setPage] = useState<number>(0);
  const [numberOfItemsPerPageList] = useState([15, 25, 50, 100]);
  const [itemsPerPage, onItemsPerPageChange] = useState(
    numberOfItemsPerPageList[0]
  );

  const inventoryQuery = useQuery({
    queryKey: ['inventoryQuery', productId],
    queryFn: async () => {
      if (!productId) {
        return null;
      }
      return getInventory(productId);
    },
    enabled: !!productId,
  });
  useProgressQuery(inventoryQuery, 'inventoryQuery');
  const inventory = inventoryQuery.data;

  const from = page * itemsPerPage;
  const to = Math.min(
    (page + 1) * itemsPerPage,
    inventory ? inventory.transactions.length : 0
  );

  useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  if (!inventory) {
    return (
      <Flex
        flex={1}
        backgroundColor={color.colors.background}
        justify="center"
        align="center"
      >
        <Text>Producto no encontrado</Text>
      </Flex>
    );
  }

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <ListItem
        title={`${inventory.product.name}`}
        subtitle={`(UNIDADES) Total: ${inventory.total} - Disponible: ${inventory.totalAvailable} - Total fuera pero contabilizado en total: ${inventory.totalOutsideCountingInventory}`}
      >
        <Flex flex={1} padding={10}>
          <Text variant="bodyLarge">Detalles de Producto</Text>
          <Flex
            style={{
              padding: 5,
              borderWidth: 1,
              borderRadius: 5,
              marginBottom: 5,
              borderColor: color.colors.primary,
            }}
          >
            <Text>{inventory.product.name}</Text>
            {inventory.product.description && (
              <Text>{inventory.product.description}</Text>
            )}
          </Flex>
        </Flex>
      </ListItem>
      <ListItem
        title={`Artículos de ${inventory.product.name}`}
        subtitle={`Total de distintos articulos: ${inventory.articles.length}`}
      >
        <ScrollView style={{ width: '100%', maxHeight: 400, padding: 10 }}>
          <Text variant="bodyLarge">Articulos</Text>
          {inventory.articles.map((article) => (
            <Flex
              key={article.id}
              style={{
                padding: 5,
                borderWidth: 1,
                borderRadius: 5,
                marginBottom: 5,
                borderColor: color.colors.primary,
              }}
            >
              <Text>ID: {article.id}</Text>
              <Text>
                Multiplo: {article.multiple} - Factor: {article.factor}
              </Text>
              <Text>Almacen: {article.warehouse.name ?? 'N/A'}</Text>
              <Text>Código de barras: {article.barcode}</Text>
            </Flex>
          ))}
        </ScrollView>
      </ListItem>
      <Text
        variant="titleSmall"
        style={{
          padding: 10,
          textAlign: 'center',
        }}
      >
        Transacciones en donde se encuentra el producto
      </Text>
      <DataTable
        style={{
          flex: 1,
        }}
      >
        <DataTable.Header>
          <DataTable.Title style={styles.columnMid}>Folio</DataTable.Title>
          <DataTable.Title style={styles.columnShort}>
            Tipo de transacción
          </DataTable.Title>
          {/* <DataTable.Title style={styles.columnMid}>
            Fecha de captura
          </DataTable.Title> */}
          <DataTable.Title style={styles.columnMid}>
            Fecha de transacción
          </DataTable.Title>
        </DataTable.Header>
        <ScrollView style={styles.scrollView}>
          {inventory.transactions.length > 0 &&
            inventory.transactions.slice(from, to).map((item, index) => (
              <DataTable.Row
                key={index}
                onPress={() => {
                  router.push({
                    pathname: '/(application)/transacciones',
                    params: {
                      id: item.id,
                    },
                  });
                }}
              >
                <DataTable.Cell style={styles.columnMid}>
                  {item.folio_number}
                </DataTable.Cell>
                <DataTable.Cell style={styles.columnShort}>
                  {item.transaction_type == 'ENTRY' ? 'Entrada' : 'Salida'}
                </DataTable.Cell>
                {/* <DataTable.Cell style={styles.columnMid}>
                  {format({
                    date: item.createdAt,
                    format: 'medium',
                    locale: 'es',
                  })}
                </DataTable.Cell> */}
                <DataTable.Cell style={styles.columnMid}>
                  {format({
                    date: item.transaction_date,
                    format: 'medium',
                    locale: 'es',
                  })}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          {!inventory.transactions.length && (
            <DataTable.Row>
              <DataTable.Cell centered style={styles.columnNoData}>
                No data
              </DataTable.Cell>
            </DataTable.Row>
          )}
        </ScrollView>
        <DataTable.Pagination
          page={page}
          numberOfPages={Math.ceil(
            inventory.transactions.length / itemsPerPage
          )}
          onPageChange={(page) => setPage(page)}
          label={`${from + 1}-${to} of ${inventory.transactions.length}`}
          numberOfItemsPerPageList={numberOfItemsPerPageList}
          numberOfItemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          showFastPaginationControls
          selectPageDropdownLabel={'Rows per page'}
        />
      </DataTable>
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '100%',
  },
  columnLong: {
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
