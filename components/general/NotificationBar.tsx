import { Notification, useNotification } from '@/stores/notificationStore';
import { useEffect, useState } from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button, Portal, Snackbar } from 'react-native-paper';
import { $RemoveChildren } from 'react-native-paper/lib/typescript/types';

export function NotificationBar() {
  const notifications = useNotification((state) => state.notifications);
  const popNotification = useNotification((state) => state.popNotification);
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<
    Notification | undefined
  >();
  const [action, setAction] = useState<
    ($RemoveChildren<typeof Button> & { label: string }) | undefined
  >();

  function handleClose() {
    setOpen(false);
    setCurrentNotification(undefined);
    setAction(undefined);
  }

  function handleExited() {
    setCurrentNotification(undefined);
  }

  useEffect(() => {
    if (notifications.length && !currentNotification) {
      setCurrentNotification({ ...notifications[0] });
      if (notifications[0].action) {
        setAction({
          label: notifications[0].action.label,
          onPress: (_e: GestureResponderEvent) => {
            notifications[0].action?.onClick();
            handleClose();
          },
        });
      }
      popNotification();
      setOpen(true);
    } else if (notifications.length && currentNotification && open) {
      setOpen(false);
      setCurrentNotification(undefined);
      setAction(undefined);
    }
  }, [notifications, currentNotification, open]);

  return (
    <Portal>
      <Snackbar
        key={currentNotification ? currentNotification.key : undefined}
        visible={open}
        onDismiss={handleClose}
        action={action}
        duration={currentNotification?.duration ?? 5000}
        icon={'progress-close'}
        onIconPress={handleClose}
      >
        {currentNotification
          ? `${currentNotification.code ?? ''}${currentNotification.code ? ' - ' : ''}${currentNotification.message}`
          : undefined}
      </Snackbar>
    </Portal>
  );
}
