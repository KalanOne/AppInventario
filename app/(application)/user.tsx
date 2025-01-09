import { getUser, updateUser } from '@/api/user.api';
import { useProgressQuery } from '@/hooks/progress';
import { useQuery } from '@tanstack/react-query';
import { Button, Text } from 'react-native-paper';
import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { ScrollView } from 'react-native';
import { z } from 'zod';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CTextInput } from '@/components/form/CTextInput';
import { useEffect } from 'react';
import { useCrudMutationF } from '@/hooks/crud';
import { UserUpdate } from '@/types/usuario';

export default function User() {
  const color = useAppTheme();
  const userQuery = useQuery({
    queryKey: ['userQuery'],
    queryFn: async () => {
      return getUser();
    },
  });
  useProgressQuery(userQuery, 'userQuery');
  const user = userQuery.data ?? null;

  const userUpdateForm = useForm<
    UserUpdateInputType,
    unknown,
    UserUpdateSchemaType
  >({
    defaultValues: userUpdateDefaultValues,
    resolver: zodResolver(userUpdateSchema),
  });

  const userUpdateMutation = useCrudMutationF(
    updateUser,
    'userQuery',
    'update'
  );

  function handleUserUpdate(data: UserUpdateInputType) {
    if (!user) return;
    const newData: UserUpdate = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    };
    userUpdateMutation.mutate({
      data: newData,
      id: user.id,
      extras: undefined,
    });
  }

  useEffect(() => {
    if (user) {
      userUpdateForm.reset(user);
    }
  }, [user]);

  if (!user) {
    return (
      <Flex flex={1} justify="center" align="center">
        <Text>Usuario no encontrado.</Text>
      </Flex>
    );
  }

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <Text variant="titleMedium" style={{ padding: 10, textAlign: 'center' }}>
        Información de: {user.first_name} {user.last_name}
      </Text>
      <ScrollView style={{ flex: 1, padding: 10 }}>
        <FormProvider {...userUpdateForm}>
          <CTextInput label={'Nombre'} name={'first_name'} />
          <CTextInput label={'Apellido'} name={'last_name'} />
          <CTextInput
            label={'Email'}
            name={'email'}
            keyboardType="email-address"
          />
          <CTextInput
            label={'Contraseña'}
            name={'password'}
            secureTextEntry={true}
          />
          <CTextInput
            label={'Confirmar Contraseña'}
            name={'confirmPassword'}
            secureTextEntry={true}
          />
          <Flex
            direction="row"
            justify="center"
            align="center"
            style={{ marginTop: 20 }}
          >
            <Button
              mode="contained"
              onPress={userUpdateForm.handleSubmit(handleUserUpdate)}
            >
              Enviar
            </Button>
          </Flex>
        </FormProvider>
      </ScrollView>
    </Flex>
  );
}

const userUpdateSchema = z
  .object({
    first_name: z.string().nonempty(),
    last_name: z.string().nonempty(),
    email: z.string().nonempty().email(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.confirmPassword) {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Las contraseñas no coinciden',
          path: ['confirmPassword'],
        });
      }
    } else if (data.password || data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ambas contraseñas deben ser completadas',
        path: ['confirmPassword'],
      });
    }
  });

type UserUpdateSchemaType = z.infer<typeof userUpdateSchema>;

type UserUpdateInputType = z.input<typeof userUpdateSchema>;

const userUpdateDefaultValues: UserUpdateInputType = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  confirmPassword: '',
};
