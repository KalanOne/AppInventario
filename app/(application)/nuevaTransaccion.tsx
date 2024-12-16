import { Flex } from '@/components/Flex';
import { CreateModal } from '@/components/form/CreateModal';
import { CSelectInput } from '@/components/form/CSelectInput';
import { CTextInput } from '@/components/form/CTextInput';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Button, DataTable, IconButton, Text } from 'react-native-paper';
import { z } from 'zod';

export default function NuevaTransaccionScreen() {
  const color = useAppTheme();
  const [articlesAddVisible, setArticlesAddVisible] = useState(false);

  const transactionCreateForm = useForm<
    TransactionCreateInputType,
    unknown,
    TransactionCreateSchemaType
  >({
    defaultValues: transactionCreateDefaultValues,
    resolver: zodResolver(transactionCreateSchema),
  });

  const [type, articles] = useWatch({
    control: transactionCreateForm.control,
    name: ['type', 'articles'],
  });

  const articleAddForm = useForm<
    ArticleAddInputType,
    unknown,
    ArticleAddSchemaType
  >({
    defaultValues: articleAddDefaultValues,
    resolver: zodResolver(articleAddSchema),
  });

  const [articleId] = useWatch({
    control: articleAddForm.control,
    name: ['articleId'],
  });

  function addArticlePress() {
    setArticlesAddVisible(true);
  }

  function addArticle() {
    const article = articleAddForm.getValues();
    transactionCreateForm.setValue('articles', [...articles, article]);
    articleAddForm.reset();
    setArticlesAddVisible(false);
  }

  function removeArticle(articleId: string) {
    transactionCreateForm.setValue(
      'articles',
      articles.filter((item) => item.articleId !== articleId)
    );
  }

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <FormProvider {...transactionCreateForm}>
        <Flex padding={10}>
          <CSelectInput
            label="Tipo de transacción"
            name="type"
            data={[
              { key: 'income', value: 'Ingreso' },
              { key: 'expense', value: 'Egreso' },
            ]}
            getKey={(item) => item.key}
            getValue={(item) => item.value}
            multiple={false}
          />
          <CTextInput
            label={type == 'income' ? 'Emisor' : 'Receptor'}
            name="emitter"
          />
          <Flex direction="row">
            <Text
              style={{
                flex: 1,
                marginTop: 10,
                textAlign: 'center',
              }}
              variant="titleMedium"
            >
              {type == 'income'
                ? 'Productos a ingresar'
                : 'Productos a egresar'}
            </Text>
            <IconButton
              icon="plus"
              mode="contained"
              onPress={addArticlePress}
              style={{ marginTop: 10 }}
            />
          </Flex>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={styles.columnName}>
                Product name
              </DataTable.Title>
              <DataTable.Title style={styles.columnShort}>
                Multiple
              </DataTable.Title>
              <DataTable.Title style={styles.columnShort} numeric>
                Factor
              </DataTable.Title>
            </DataTable.Header>
            <ScrollView style={styles.scrollView}>
              {articles.length > 0 &&
                articles.map((item) => (
                  <DataTable.Row
                    key={item.articleId}
                    // onPress={() => {
                    //   handleRowPress(item);
                    // }}
                  >
                    <DataTable.Cell style={styles.columnName}>
                      {item.articleId}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnShort}>
                      {item.serial}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnShort} numeric>
                      {item.quantity}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.columnShort} numeric>
                      <IconButton
                        icon={'delete'}
                        onPress={() => removeArticle(item.articleId)}
                      />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              {!articles.length && (
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
      <CreateModal
        form={transactionCreateForm}
        visible={articlesAddVisible}
        handleCreateDismiss={() => {
          setArticlesAddVisible(false);
        }}
        handleCreateApply={articleAddForm.handleSubmit(addArticle)}
        handleCreateCancel={() => {
          articleAddForm.reset();
          setArticlesAddVisible(false);
        }}
        handleCreateReset={() => {
          articleAddForm.reset();
        }}
      >
        <CTextInput label="Article ID" name="articleId" />
        <CTextInput label="Serial" name="serial" />
        <CTextInput label="Quantity" name="quantity" />
      </CreateModal>
    </Flex>
  );
}

const transactionCreateSchema = z.object({
  type: z.enum(['income', 'expense']),
  emitter: z.string(),
  articles: z.array(
    z.object({
      articleId: z.string(),
      serial: z.string().optional(),
      quantity: z.number().int().positive().min(1),
    })
  ),
});

type TransactionCreateSchemaType = z.infer<typeof transactionCreateSchema>;

type TransactionCreateInputType = z.input<typeof transactionCreateSchema>;

const transactionCreateDefaultValues: TransactionCreateInputType = {
  type: 'income',
  emitter: '',
  articles: [],
};

const articleAddSchema = z.object({
  articleId: z.string(),
  serial: z.string().optional(),
  quantity: z.number().int().positive().min(1),
});

type ArticleAddSchemaType = z.infer<typeof articleAddSchema>;

type ArticleAddInputType = z.input<typeof articleAddSchema>;

const articleAddDefaultValues: ArticleAddInputType = {
  articleId: '',
  serial: '',
  quantity: 1,
};

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: '60%',
    minHeight: '60%',
  },
  columnName: {
    flex: 3,
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
