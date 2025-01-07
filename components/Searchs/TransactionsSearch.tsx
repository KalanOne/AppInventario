import { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { Button, Icon, Modal, Portal, Text } from 'react-native-paper';

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
  const [firstLoad, setFirstLoad] = useState(true);
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

  const trasactionsSearchQuery = useQuery({
    queryKey: ['trasactionsSearch'],
    queryFn: async () => {
      return getTransactionsSearch();
    },
    refetchInterval: 15 * 60000,
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
      if (firstLoad) {
        setFirstLoad(false);
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
            data={formattedArticles}
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
