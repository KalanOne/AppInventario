import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { StyleSheet } from "react-native";
import { Button, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CTextInput } from "@/components/form/CTextInput";
import { useCrudMutationF } from "@/hooks/crud";

import { loginApi } from "@/api/login.api";
import { router } from "expo-router";
import { useStorageState } from "@/hooks/useStorageState";
import { useSessionStore } from "@/stores/sessionStore";
import { useEffect } from "react";

export default function Login() {
  const color = useAppTheme();
  const [[_isLoadingJwt, _jwt], setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? "TOKEN_SECRET"
  );
  const [[_isLoadingEmail, _email], setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? "EMAIL_SECRET"
  );
  const signIn = useSessionStore((state) => state.signIn);

  const loginForm = useForm({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(loginSchema),
  });

  const [emailForm] = useWatch({ control: loginForm.control, name: ["email"] });

  const loginMutation = useCrudMutationF(loginApi, "login", "custom", {
    onSuccess: (response) => {
      if (response == undefined) { return; };
      signIn(emailForm, response.access_token);
      setJwt(response.access_token);
      setEmail(emailForm);
    },
    successNotification: {
      message: "Inicio de sesión exitoso",
    },
  });

  async function login(values: LoginSchemaType) {
    loginMutation.mutate({
      data: values,
      extras: undefined,
    });
  }

  useEffect(() => {
    if (loginMutation.isSuccess) {
      router.replace({ pathname: "/home" });
    }
  }, [loginMutation.isSuccess]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Text variant="titleLarge" style={styles.title}>
          Inicia sesión
        </Text>
        <FormProvider {...loginForm}>
          <Flex style={styles.inputsContainer}>
            <CTextInput name="email" label="Email" autoCapitalize="none" />
            <CTextInput
              name="password"
              label="Password"
              secureTextEntry={true}
              autoCapitalize="none"
            />
          </Flex>
          <Flex align="center">
            <Button mode="contained" onPress={loginForm.handleSubmit(login)}>
              Enviar
            </Button>
          </Flex>
        </FormProvider>
      </SafeAreaView>
    </Flex>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
  },
  inputsContainer: {
    padding: 20,
    gap: 20,
  },
});

const loginSchema = z.object({
  email: z.string().email("Invalid email").min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

interface LoginDefaultValues {
  email: string;
  password: string;
}

const loginDefaultValues: LoginDefaultValues = {
  email: "",
  password: "",
};
