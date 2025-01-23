import { createRoot } from "react-dom/client";
import { greyDark, cyanDark } from "@ant-design/colors";

import App from "./App.tsx";
import { NotificationProvider } from "./components/errorcontext.tsx";
import { ConfigProvider, theme } from "antd";

const colorPrimary = cyanDark[5];
// const colorPrimary = cyanDark[5];
// const bgPallette = ["", ...greyDark];
const bgPallette = greyDark;
createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      token: {
        // Seed Token
        // bluedark settings
        colorPrimary: colorPrimary,
        colorLink: cyanDark[7],
        borderRadius: 5,
        fontSize: 16,
        colorBgBase: bgPallette[1],

        colorBgContainer: bgPallette[3],
        colorBgSpotlight: bgPallette[4],
        borderRadiusLG: 0,
        // Alias Token
      },
      components: {
        // disable changing the background color of a table column when sorting
        Table: { bodySortBg: undefined },
        // make background color of collapse content the same as the base background color
        Collapse: { contentBg: bgPallette[1] },
        Divider: { lineWidth: 2, colorSplit: colorPrimary },
      },
    }}
  >
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </ConfigProvider>
);
