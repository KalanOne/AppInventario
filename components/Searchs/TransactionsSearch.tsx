import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import {
  Button,
  HelperText,
  Icon,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';

import { getTransactionsSearch } from '@/api/searchs.api';
import { useProgressQuery } from '@/hooks/progress';
import { FormattedTransaction, TransactionSearch } from '@/types/searchs';
import { AntDesign } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';

import { Flex } from '../UI/Flex';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { router, useFocusEffect } from 'expo-router';
import { useNotification } from '@/stores/notificationStore';
import { format } from '@formkit/tempo';
import { Scanner2 } from '../scanner/Scanner2';

export { TransactionsSearch };

interface TransactionsSearchProps {
  visible: boolean;
  handleSearchDismissCancel: () => void;
  handleFoundTransaction: (transaction: TransactionSearch) => void;
}

function TransactionsSearch({
  visible,
  handleSearchDismissCancel,
  handleFoundTransaction,
}: TransactionsSearchProps) {
  const color = useAppTheme();
  const [isFocus, setIsFocus] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<FormattedTransaction | null>(
    null
  );
  const firstLoad = useRef(true);
  const [barcodeScan, setBarcodeScan] = useState<{
    barcode: string | null;
    modal: boolean;
    found: boolean | null;
  }>({
    barcode: null,
    modal: false,
    found: null,
  });
  const addNotification = useNotification((state) => state.addNotification);

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
      marginVertical: 20,
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

  const trasactionsSearchQuery = useQuery({
    queryKey: ['trasactionsSearch'],
    queryFn: async () => {
      return getTransactionsSearch();
    },
    refetchInterval: 30 * 60000,
  });
  useProgressQuery(trasactionsSearchQuery, 'trasactionsSearch');
  const transactions = trasactionsSearchQuery.data ?? [];

  const formattedArticles: FormattedTransaction[] = useMemo(() => {
    return transactions.map((transaction) => ({
      ...transaction,
      name: `${transaction.folio_number} - ${format({ date: transaction.createdAt, format: 'full', locale: 'es' })} - ${format({ date: transaction.transaction_date, format: 'full', locale: 'es' })} - ${transaction.transaction_type == 'ENTRY' ? 'Entrada' : 'Salida'} - ${transaction.user.first_name} ${transaction.user.last_name} - ${transaction.person_name}`,
    }));
  }, [transactions]);

  function handlefound() {
    if (selectedDrop) {
      transactions.find((transaction) => {
        if (transaction.id == selectedDrop.id) {
          handleFoundTransaction(transaction);
        }
        return transaction.id === selectedDrop.id;
      });
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

  function handleBarcodeScan(barcode: string) {
    const transactionsFiltered = transactions.filter((transaction) =>
      transaction.codes.includes(barcode)
    );
    if (transactionsFiltered.length > 0) {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: true,
      });
    } else {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: false,
      });
    }
  }

  function handleBarcodeChange(barcode: string) {
    const transactionsFiltered = transactions.filter((transaction) =>
      transaction.codes.includes(barcode)
    );
    if (transactionsFiltered.length > 0) {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: true,
      });
    } else {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: false,
      });
    }
  }

  useEffect(() => {
    if (trasactionsSearchQuery.isError && !trasactionsSearchQuery.isLoading) {
      if (trasactionsSearchQuery.error.status === 401) {
        addNotification({
          message: 'Session expired',
          code: '401',
        });
        router.push('/logout');
      } else {
        addNotification({
          message: trasactionsSearchQuery.error.message,
          code: trasactionsSearchQuery.error.status
            ? trasactionsSearchQuery.error.status.toString()
            : 'NA',
        });
      }
    }
  }, [trasactionsSearchQuery.isError]);

  useFocusEffect(
    useCallback(() => {
      if (firstLoad.current) {
        firstLoad.current = false;
        return;
      }
      trasactionsSearchQuery.refetch();
    }, [])
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleSearchDismissCancelLocal}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Buscar transacciones
          </Text>
          <TextInput
            value={barcodeScan.barcode ?? ''}
            onChangeText={handleBarcodeChange}
            placeholder="Barcode"
            right={
              <TextInput.Icon
                icon="barcode-scan"
                onPress={() =>
                  setBarcodeScan({
                    barcode: null,
                    modal: true,
                    found: null,
                  })
                }
              />
            }
          />
          {barcodeScan.found === false && barcodeScan.barcode && (
            <HelperText
              type="info"
              padding={'none'}
              style={{
                color: color.colors.primary,
              }}
            >
              Transactions not found by article barcode
            </HelperText>
          )}
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
            data={
              barcodeScan.barcode
                ? formattedArticles.filter((item) =>
                    barcodeScan.barcode
                      ? item.codes.includes(barcodeScan.barcode)
                      : false
                  )
                : formattedArticles
            }
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
          {barcodeScan.barcode && (
            <HelperText
              type="info"
              padding={'none'}
              style={{
                color: color.colors.primary,
              }}
            >
              {barcodeScan.found === true
                ? 'Transactions found by article barcode'
                : 'Transactions not found by article barcode'}
            </HelperText>
          )}
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
      <Scanner2
        visible={barcodeScan.modal}
        onDismissCancel={() =>
          setBarcodeScan((prev) => ({ ...prev, modal: false }))
        }
        onBarcodeScanned={handleBarcodeScan}
      />
    </Portal>
  );
}
