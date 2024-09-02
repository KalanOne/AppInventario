import { Flex } from "@/components/Flex";
import { useAppTheme } from "@/components/providers/Material3ThemeProvider";
import { useEffect } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CTextInput } from "@/components/form/CTextInput";

let paddingTop = 0;

export default function Login() {
  const color = useAppTheme();
  const insets = useSafeAreaInsets();

  const loginForm = useForm({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(loginSchema),
  });

  async function login(values: LoginSchemaType) {
    console.log(values);
  }

  useEffect(() => {
    paddingTop = insets.top;
  }, [insets]);

  return (
    <Flex flex={1} backgroundColor={color.colors.background}>
      <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
        <Text variant="titleLarge" style={styles.title}>
          Inicia sesión
        </Text>
        <FormProvider {...loginForm}>
          <Flex style={styles.inputsContainer}>
            <CTextInput name="email" label="Email" />
            <CTextInput
              name="password"
              label="Password"
              secureTextEntry={true}
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
