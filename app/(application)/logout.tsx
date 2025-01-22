import { Flex } from '@/components/UI/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useStorageState } from '@/hooks/useStorageState';
import { useSessionStore } from '@/stores/sessionStore';
import { usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function LogoutScreen() {
  const color = useAppTheme();
  const signOut = useSessionStore((state) => state.signOut);
  const [jwtArray, setJwt] = useStorageState(
    process.env.EXPO_PUBLIC_TOKEN_SECRET ?? 'TOKEN_SECRET'
  );
  const [emailArray, setEmail] = useStorageState(
    process.env.EXPO_PUBLIC_EMAIL_SECRET ?? 'EMAIL_SECRET'
  );
  const [secondRender, setSecondRender] = useState(false);
  const actualPathName = usePathname();

  function Logout() {
    signOut({
      setJwt: setJwt,
      setEmail: setEmail,
      actualPathName: actualPathName,
    });
    // setJwt(null);
    // setEmail(null);
  }

  // useEffect(() => {
  //   if (secondRender) {
  //     Logout();
  //   } else {
  //     setSecondRender(true);
  //   }
  // }, [secondRender]);

  useEffect(() => {
    Logout();
  }, []);

  return <Flex flex={1} backgroundColor={color.colors.background} />;
}
