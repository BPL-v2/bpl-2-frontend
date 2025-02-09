import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { ConfigProvider, theme } from "antd";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        fontSize: 18,
        colorBgBase: "var(--color-base-100)",
        colorBgContainer: "var(--color-base-300)",
        colorBgSpotlight: "var(--color-base-200)",
        colorBgElevated: "var(--color-base-300)",
        colorTextBase: "var(--color-base-content)",
        colorText: "var(--color-base-content)",
      },
      components: {
        Table: {
          bodySortBg: undefined,
          headerBg: "var(--color-base-200)",
          rowHoverBg: "var(--color-base-200)",
          headerSortHoverBg: "var(--color-base-300)",
          headerSortActiveBg: "var(--color-base-300)",
          cellFontSize: 14,
        },
      },
    }}
  >
    <App />
  </ConfigProvider>
);
