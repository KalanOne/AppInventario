import { create } from "zustand";

interface SessionJwt {
  jwt: string;
  email: string;
}

interface SessionState {
  signIn: (email: string, jwt: string) => void;
  signOut: () => void;
  session: SessionJwt | null;
}

export const useSessionStore = create<SessionState>((set) => {
  return {
    signIn: (email, jwt) => {
      set(() => ({
        session: { email, jwt },
      }));
    },
    signOut: () => {
      set(() => ({
        session: null,
      }));
    },
    session: null,
  };
});
