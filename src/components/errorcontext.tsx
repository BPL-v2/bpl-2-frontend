import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { notification } from "antd";

interface ErrorContextType {
  sendNotification: (message: string, type: NotificationType) => void;
}

export const ErrorContext = createContext<ErrorContextType | undefined>(
  undefined
);

export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

type NotificationType = "error" | "warning" | "success";

type Notification = {
  message: string;
  type: NotificationType;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [api, contextHolder] = notification.useNotification();
  const [note, setNote] = useState<Notification | null>(null);

  const triggerError = (message: string, type: NotificationType) => {
    setNote({ message, type });
  };

  useEffect(() => {
    if (note) {
      switch (note.type) {
        case "error":
          api.error({
            message: "Error",
            description: note.message,
          });
          break;
        case "warning":
          api.warning({
            message: "Warning",
            description: note.message,
          });
          break;
        case "success":
          api.success({
            message: "Success",
            description: note.message,
          });
          break;
      }
      setNote(null);
    }
  }, [note, api]);

  return (
    <ErrorContext.Provider value={{ sendNotification: triggerError }}>
      {contextHolder}
      {children}
    </ErrorContext.Provider>
  );
};
