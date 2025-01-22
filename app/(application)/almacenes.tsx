import {
  createWarehouses,
  getWarehouses,
  updateWarehouses,
} from '@/api/almacenes.api';
import { CreateModal } from '@/components/form/CreateModal';
import { CTextInput } from '@/components/form/CTextInput';
import { UpdateModal } from '@/components/form/UpdateModal';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { Flex } from '@/components/UI/Flex';
import { useCrud, useCrudMutationF, useCrudQuery } from '@/hooks/crud';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { DataTable, IconButton, Text } from 'react-native-paper';
import { z } from 'zod';

export default function AlmacenesScreen() {
  const color = useAppTheme();

  const crud = useCrud<any>();
  const warehousesQuery = useCrudQuery({
    apiFunction: getWarehouses,
    name: 'warehousesQuery',
    page: crud.page,
    limit: crud.itemsPerPage,
    search: crud.search,
    filters: crud.filters,
    keepPrevious: true,
    extras: undefined,
  });
  const warehouses = warehousesQuery.data ? warehousesQuery.data[0] : [];

  const warehousesUpdateMutation = useCrudMutationF(
    updateWarehouses,
    'warehousesQuery',
    'update',
    {
      onSuccess: () => {
        crud.setUpdateModalOpen(false);
      },
    }
  );

  const warehousesCreateMutation = useCrudMutationF(
    createWarehouses,
    'warehousesQuery',
    'create',
    {
      onSuccess: () => {
        crud.setCreateModalOpen(false);
      },
    }
  );

  const warehouseCreateForm = useForm<
    WarehouseCreateInputType,
    unknown,
    WarehouseCreateSchemaType
  >({
    defaultValues: warehouseCreateDefaultValues,
    resolver: zodResolver(warehouseCreateSchema),
  });

  const warehouseUpdateForm = useForm<
    WarehouseUpdateInputType,
    unknown,
    WarehouseUpdateSchemaType
  >({
    defaultValues: warehouseUpdateDefaultValues,
    resolver: zodResolver(warehouseUpdateSchema),
  });

  function handleRowPress(item: any) {
    crud.setUpdateModalOpen(true);
    crud.setCurrent(item);
    warehouseUpdateForm.reset({
      name: item.name,
    });
  }

  function handleUpdateApply(data: WarehouseUpdateInputType) {
    warehousesUpdateMutation.mutate({
      id: crud.current.id,
      data,
      extras: undefined,
    });
  }

  function handleCreatePress() {
    crud.setCreateModalOpen(true);
  }

  function handleCreateReset() {
    warehouseCreateForm.reset(warehouseCreateDefaultValues);
    crud.setCreateModalOpen(false);
    crud.setCurrent(undefined);
  }

  function handleCreateApply(data: WarehouseCreateInputType) {
    warehousesCreateMutation.mutate(
      {
        data,
        extras: undefined,
      },
      {
        onSuccess: () => {
          warehouseCreateForm.reset(warehouseCreateDefaultValues);
        },
      }
    );
  }

  useEffect(() => {
    if (warehouses) {
      crud.setTotal(warehousesQuery.data ? warehousesQuery.data[1] : 0);
    }
  }, [warehouses]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Flex padding={10} direction="row" justify="flex-end" align="center">
        <IconButton
          icon="plus-thick"
          onPress={handleCreatePress}
          mode="contained"
        />
      </Flex>
      <DataTable
        style={{
          flex: 1,
        }}
      >
        <DataTable.Header>
          <DataTable.Title style={styles.columnName}>Nombre</DataTable.Title>
        </DataTable.Header>
        <ScrollView style={styles.scrollView}>
          {warehouses.length > 0 &&
            warehouses.map((item) => (
              <DataTable.Row
                key={item.id}
                onPress={() => {
                  handleRowPress(item);
                }}
              >
                <DataTable.Cell style={styles.columnName}>
                  {item.name}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          {!warehouses.length && (
            <DataTable.Row>
              <DataTable.Cell centered style={styles.columnNoData}>
                No data
              </DataTable.Cell>
            </DataTable.Row>
          )}
        </ScrollView>
        <DataTable.Pagination
          page={crud.page}
          numberOfPages={crud.numberOfPages}
          onPageChange={crud.setPage}
          label={`${crud.from + 1}-${crud.to} of ${crud.total}`}
          numberOfItemsPerPageList={crud.numberOfItemsPerPageList}
          numberOfItemsPerPage={crud.itemsPerPage}
          onItemsPerPageChange={crud.setItemsPerPage}
          showFastPaginationControls
          selectPageDropdownLabel={'Rows per page'}
        />
      </DataTable>
      <UpdateModal
        visible={crud.updateModalOpen}
        handleUpdateDismiss={() => {
          crud.setUpdateModalOpen(false);
        }}
        handleUpdateApply={warehouseUpdateForm.handleSubmit(handleUpdateApply)}
        handleUpdateCancel={() => {
          crud.setUpdateModalOpen(false);
        }}
        form={warehouseUpdateForm}
      >
        <CTextInput name="name" label="Name" />
      </UpdateModal>
      <CreateModal
        visible={crud.createModalOpen}
        handleCreateDismiss={() => {
          crud.setCreateModalOpen(false);
        }}
        handleCreateApply={warehouseCreateForm.handleSubmit(handleCreateApply)}
        handleCreateCancel={() => {
          crud.setCreateModalOpen(false);
        }}
        handleCreateReset={handleCreateReset}
        form={warehouseCreateForm}
      >
        <CTextInput name="name" label="Name" />
      </CreateModal>
    </Flex>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  columnName: {
    flex: 3,
  },
  columnShort: {
    flex: 1,
  },
  columnNoData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const warehouseCreateSchema = z.object({
  name: z.string().min(1).max(255),
});

type WarehouseCreateSchemaType = z.infer<typeof warehouseCreateSchema>;

type WarehouseCreateInputType = z.input<typeof warehouseCreateSchema>;

const warehouseCreateDefaultValues: WarehouseCreateInputType = {
  name: '',
};

const warehouseUpdateSchema = z.object({
  name: z.string().min(1).max(255),
});

type WarehouseUpdateSchemaType = z.infer<typeof warehouseUpdateSchema>;

type WarehouseUpdateInputType = z.input<typeof warehouseUpdateSchema>;

const warehouseUpdateDefaultValues: WarehouseUpdateInputType = {
  name: '',
};
