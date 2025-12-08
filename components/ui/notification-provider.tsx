'use client';

import * as React from 'react';
import { useNotification } from '@/hooks/use-notification';

import * as Notification from '@/components/ui/notification';

const NotificationProvider = () => {
  const { notifications } = useNotification();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <Notification.Provider>
      {notifications.map(({ id, ...rest }) => {
        return <Notification.Root key={id} id={id} {...rest} />;
      })}
      <Notification.Viewport />
    </Notification.Provider>
  );
};

export { NotificationProvider };
