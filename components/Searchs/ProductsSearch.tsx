import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Icon, Modal, Portal, Text } from 'react-native-paper';

import { getProductsSearch } from '@/api/searchs.api';
import { useProgressQuery } from '@/hooks/progress';
import { Product } from '@/types/searchs';
import { AntDesign } from '@expo/vector-icons';
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
  const [isFocus, setIsFocus] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<Product | null>(null);

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

  const DropDownStyles = StyleSheet.create({
    container: {
      backgroundColor: color.colors.surfaceBright,
      padding: 16,
    },
    dropdown: {
      height: 50,
      borderColor: 'gray',
      borderWidth: 0.5,
      borderRadius: 8,
      paddingHorizontal: 8,
      marginBottom: 20,
    },
    icon: {
      marginRight: 5,
    },
    label: {
      position: 'absolute',
      backgroundColor: 'white',
      left: 22,
      top: 8,
      zIndex: 999,
      paddingHorizontal: 8,
      fontSize: 14,
    },
    placeholderStyle: {
      fontSize: 16,
      color: color.colors.secondary,
      marginStart: 10,
    },
    selectedTextStyle: {
      fontSize: 16,
      color: color.colors.secondary,
      marginStart: 10,
    },
    iconStyle: {
      width: 20,
      height: 20,
    },
    inputSearchStyle: {
      backgroundColor: color.colors.surfaceBright,
      borderRadius: 10,
      color: color.colors.secondary,
      borderColor: color.colors.primary,
    },
    containerStyle: {
      backgroundColor: color.colors.surfaceBright,
      color: color.colors.secondary,
      borderRadius: 10,
      borderColor: color.colors.primary,
    },
    itemTextStyle: {
      color: color.colors.secondary,
    },
  });

  const productsSearchQuery = useQuery({
    queryKey: ['productsSearch'],
    queryFn: async () => {
      return await getProductsSearch();
    },
    refetchInterval: 15 * 60000,
  });
  useProgressQuery(productsSearchQuery, 'productsSearch');
  const products = productsSearchQuery.data ?? [];

  function handlefound() {
    if (selectedDrop) {
      handleFoundProduct(selectedDrop);
      setSelectedDrop(null);
    } else {
      handleSearchDismissCancelLocal();
    }
  }

  function handleSearchDismissCancelLocal() {
    setSelectedDrop(null);
    setIsFocus(false);
    handleSearchDismissCancel();
  }

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleSearchDismissCancelLocal}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Buscar productos
          </Text>
          <Dropdown
            style={[
              DropDownStyles.dropdown,
              isFocus && { borderColor: color.colors.primary },
            ]}
            placeholderStyle={DropDownStyles.placeholderStyle}
            selectedTextStyle={DropDownStyles.selectedTextStyle}
            inputSearchStyle={DropDownStyles.inputSearchStyle}
            iconStyle={DropDownStyles.iconStyle}
            containerStyle={DropDownStyles.containerStyle}
            itemTextStyle={DropDownStyles.itemTextStyle}
            data={products}
            search
            maxHeight={300}
            labelField="name"
            valueField="id"
            placeholder={!isFocus ? 'Select item' : '...'}
            searchPlaceholder="Search..."
            value={selectedDrop}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setSelectedDrop(item);
              setIsFocus(false);
            }}
            renderLeftIcon={() => (
              <Icon
                source={'magnify'}
                color={isFocus ? color.colors.primary : color.colors.secondary}
                size={20}
              />
            )}
            renderItem={(item, selected) => (
              <Flex
                direction="row"
                align="center"
                style={{ padding: 10 }}
                gap={10}
                backgroundColor={
                  selected ? color.colors.primaryContainer : 'transparent'
                }
              >
                <Text style={{ color: color.colors.secondary }}>
                  {item.name}
                </Text>
                {selected && (
                  <AntDesign
                    name="check"
                    size={20}
                    color={color.colors.primary}
                  />
                )}
              </Flex>
            )}
          />
          <Flex
            direction="row"
            align="center"
            justify="space-between"
            style={styles.buttonsContainer}
          >
            <Flex>
              <Button
                onPress={handleSearchDismissCancelLocal}
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
                disabled={!selectedDrop}
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
