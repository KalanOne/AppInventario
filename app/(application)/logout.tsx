import { Flex } from '@/components/Flex';
import { useAppTheme } from '@/components/providers/Material3ThemeProvider';
import { useStorageState } from '@/hooks/useStorageState';
import { useSessionStore } from '@/stores/sessionStore';
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

  function Logout() {
    signOut();
    setJwt(null);
    setEmail(null);
  }

  useEffect(() => {
    if (secondRender) {
      Logout();
    } else {
      setSecondRender(true);
    }
  }, [secondRender]);

  return <Flex flex={1} backgroundColor={color.colors.background} />;
}
