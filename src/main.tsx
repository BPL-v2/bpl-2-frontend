import { createRoot } from "react-dom/client";
import "./index.css";
import { greyDark, cyan } from "@ant-design/colors";

import App from "./App.tsx";
import { NotificationProvider } from "./components/errorcontext.tsx";
import { ConfigProvider, theme } from "antd";
createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      token: {
        // Seed Token
        // bluedark settings
        // colorBgBase: "#20252E",
        // colorBgContainer: "#2A303C",
        colorPrimary: cyan[4],
        borderRadius: 5,
        colorTextSecondary: "#d3adf7",
        fontSize: 16,
        colorBgBase: greyDark[1],

        colorBgContainer: greyDark[3],
        colorBgSpotlight: greyDark[4],
        // Alias Token
      },
    }}
  >
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ConfigProvider>
);
