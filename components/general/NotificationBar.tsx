import { Notification, useNotification } from "@/stores/notificationStore";
import { useEffect, useState } from "react";
import { Button, Snackbar } from "react-native-paper";
import { $RemoveChildren } from "react-native-paper/lib/typescript/types";

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

  useEffect(() => {
    if (notifications.length && !currentNotification) {
      setCurrentNotification({ ...notifications[0] });
      if (notifications[0].action) {
        setAction({
          label: notifications[0].action.label,
          onPress: notifications[0].action.onClick,
        });
      }
      popNotification();
      setOpen(true);
    } else if (notifications.length && currentNotification && open) {
      setOpen(false);
    }
  }, [notifications, currentNotification, open]);

  const handleClose = () =>
    // _event: React.SyntheticEvent | Event,
    // reason?: string
    {
      // if (reason === "clickaway") {
      //   return;
      // }
      setOpen(false);
    };

  const handleExited = () => {
    setCurrentNotification(undefined);
  };

  return (
    <Snackbar
      key={currentNotification ? currentNotification.key : undefined}
      visible={open}
      // anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onDismiss={handleClose}
      // TransitionProps={{ onExited: handleExited }}
      action={action}
    >
      {currentNotification ? currentNotification.message : undefined}
    </Snackbar>
  );
}
