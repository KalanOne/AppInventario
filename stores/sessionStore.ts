import { router } from 'expo-router';
import { create } from 'zustand';

interface SessionJwt {
  jwt: string;
  email: string;
}

interface SessionState {
  signIn: (email: string, jwt: string) => void;
  signOut: ({
    setJwt,
    setEmail,
    actualPathName,
  }: {
    setJwt: (value: string | null) => void;
    setEmail: (value: string | null) => void;
    actualPathName: string;
  }) => Promise<void>;
  session: SessionJwt | null;
}

export const useSessionStore = create<SessionState>((set) => {
  return {
    signIn: (email, jwt) => {
      set(() => ({
        session: { email, jwt },
      }));
    },
    signOut: async ({ setJwt, setEmail, actualPathName }) => {
      setJwt(null);
      setEmail(null);
      set(() => ({
        session: null,
      }));
      if (router.canDismiss()) {
        router.dismissAll();
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (actualPathName != '/') {
        router.replace({ pathname: '/' });
      }
    },
    session: null,
  };
});
