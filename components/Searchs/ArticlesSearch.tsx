import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useAppTheme } from '../providers/Material3ThemeProvider';
import { StyleSheet } from 'react-native';
import { getArticlesSearch } from '@/api/searchs.api';
import { useProgressQuery } from '@/hooks/progress';
import {
  Button,
  HelperText,
  Icon,
  Modal,
  Portal,
  Text,
  TextInput,
} from 'react-native-paper';
import { Flex } from '../Flex';
import { Dropdown } from 'react-native-element-dropdown';
import { AntDesign } from '@expo/vector-icons';
import { Article, FormattedArticle } from '@/types/searchs';
import { Scanner } from '../scanner/Scanner';

export { ArticlesSearch };

interface ArticlesSearchProps {
  visible: boolean;
  handleSearchDismissCancel: () => void;
  handleFoundArticle: (article: Article) => void;
}

function ArticlesSearch({
  visible,
  handleSearchDismissCancel,
  handleFoundArticle,
}: ArticlesSearchProps) {
  const color = useAppTheme();
  const [isFocus, setIsFocus] = useState(false);
  const [selectedDrop, setSelectedDrop] = useState<FormattedArticle | null>(
    null
  );
  const [barcodeScan, setBarcodeScan] = useState<{
    barcode: string | null;
    modal: boolean;
    found: boolean | null;
  }>({
    barcode: null,
    modal: false,
    found: null,
  });

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

  const articlesSearchQuery = useQuery({
    queryKey: ['articlesSearch'],
    queryFn: async () => {
      return await getArticlesSearch();
    },
    refetchInterval: 15 * 60000,
  });
  useProgressQuery(articlesSearchQuery, 'articlesSearch');
  const articles = articlesSearchQuery.data ?? [];

  const formattedArticles = useMemo(() => {
    return articles.map((article) => ({
      ...article,
      name: `${article.product.name} - ${article.multiple} - ${article.factor}${article.product.description ? ` - ${article.product.description}` : ''}`,
    }));
  }, [articles]);

  function handlefound() {
    if (selectedDrop) {
      articles.find((article) => {
        if (article.id == selectedDrop.id) {
          handleFoundArticle(article);
        }
        return article.id === selectedDrop.id;
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
    const article = articles.find((article) => article.barcode === barcode);
    if (article) {
      handleFoundArticle(article);
      setBarcodeScan({
        barcode: null,
        modal: false,
        found: null,
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
    const article = articles.find((article) => article.barcode === barcode);
    if (article) {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: true,
      });
      setSelectedDrop(
        formattedArticles.find((a) => a.id === article.id) ?? null
      );
    } else {
      setBarcodeScan({
        barcode: barcode,
        modal: false,
        found: false,
      });
      setSelectedDrop(null);
    }
  }

  useEffect(() => {
    if (!visible) {
      setBarcodeScan({
        barcode: null,
        modal: false,
        found: null,
      });
    }
  }, [visible]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleSearchDismissCancelLocal}
        contentContainerStyle={styles.containerStyle}
      >
        <Flex>
          <Text variant="titleLarge" style={styles.title}>
            Buscar articulos
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
              Article not found by barcode
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
      <Scanner
        visible={barcodeScan.modal}
        onDismissCancel={() =>
          setBarcodeScan((prev) => ({ ...prev, modal: false }))
        }
        onBarcodeScanned={handleBarcodeScan}
      />
    </Portal>
  );
}
