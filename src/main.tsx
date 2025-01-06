import { createRoot } from "react-dom/client";
import "./index.css";
import {
  greyDark,
  blueDark,
  greenDark,
  yellowDark,
  volcanoDark,
  limeDark,
  purpleDark,
  redDark,
  goldDark,
  geekblueDark,
  magentaDark,
  orangeDark,
  cyan,
  cyanDark,
  volcano,
  lime,
  purple,
  red,
  gold,
  geekblue,
  blue,
  magenta,
  orange,
} from "@ant-design/colors";

import App from "./App.tsx";
import { NotificationProvider } from "./components/errorcontext.tsx";
import { ConfigProvider, theme } from "antd";

const colorPrimary = blue[4];
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
        // colorBgBase: "#20252E",
        // colorBgContainer: "#2A303C",

        colorPrimary: colorPrimary,
        // colorFillSecondary: orange[5],
        borderRadius: 5,
        fontSize: 16,
        colorBgBase: bgPallette[1],

        colorBgContainer: bgPallette[3],
        colorBgSpotlight: bgPallette[4],

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
