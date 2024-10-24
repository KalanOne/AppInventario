import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { Button, Modal, Portal, Text } from 'react-native-paper';

import { getProductsSearch } from '@/api/searchs.api';
import { useProgressQuery } from '@/hooks/progress';
import { Product } from '@/types/searchs';
import { useQuery } from '@tanstack/react-query';

import { Flex } from '../Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';

export { ProductsSearch };

interface ProductsSearchProps {
  visible: boolean;
  handleSearchDismissCancel: () => void;
  handleFoundProduct: (product: Product) => void;
}

function ProductsSearch({
  visible,
  handleSearchDismissCancel,
  handleFoundProduct,
}: ProductsSearchProps) {
  const color = useAppTheme();
  const [selected, setSelected] = useState<number | null>(null);
  const [data, setData] = useState<
    Array<{
      key: string;
      value: string;
    }>
  >([]);

  const styles = StyleSheet.create({
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      padding: 10,
      margin: 10,
      borderRadius: 10,
      elevation: 5,
    },
    title: {
      marginBottom: 10,
      marginLeft: 10,
    },
    button: {
      // margin: 5,
    },
    buttonsContainer: {
      marginVertical: 10,
      width: '100%',
      paddingHorizontal: 10,
    },
  });

  const productsSearchQuery = useQuery({
    queryKey: ['productsSearch'],
    queryFn: async () => {
      return await getProductsSearch();
    },
  });
  useProgressQuery(productsSearchQuery, 'productsSearch');
  const products = productsSearchQuery.data ?? [];

  function handlefound() {
    if (selected) {
      const product = products.find((p: any) => p.id == selected);
      if (product) {
        handleFoundProduct(product);
        setSelected(null);
      } else {
        handleSearchDismissCancel();
      }
    }
  }

  useEffect(() => {
    if (products.length > 0) {
      const mappedData = products.map((product: any) => ({
        key: product.id,
        value: product.name,
      }));
      setData(mappedData);
      setSelected(null);
    }
  }, [products]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleSearchDismissCancel}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Buscar productos
          </Text>
          <SelectList
            setSelected={(val: any) => setSelected(val)}
            data={data}
            save="key"
            placeholder={'Nombre'}
          />
          <Flex
            direction="row"
            align="center"
            justify="space-between"
            style={styles.buttonsContainer}
          >
            <Flex>
              <Button
                onPress={handleSearchDismissCancel}
                mode="contained-tonal"
                style={styles.button}
              >
                Cancel
              </Button>
            </Flex>

            <Flex direction="row" align="center" gap={10} justify="flex-end">
              <Button
                onPress={handlefound}
                mode="contained-tonal"
                style={styles.button}
                disabled={!selected}
              >
                Ok
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Modal>
    </Portal>
  );
}
