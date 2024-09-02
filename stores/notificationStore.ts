import { create } from "zustand";

export { useNotification };
export type { Notification };

interface Notification {
  message: string;
  key?: number;
  code?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  popNotification: () => void;
  addNotification: (notification: Notification) => void;
}

const useNotification = create<NotificationState>()((set) => ({
  notifications: [],
  popNotification: () =>
    set((state) => ({
      notifications: state.notifications.slice(1),
    })),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, key: Date.now() },
      ],
    })),
}));
