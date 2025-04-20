import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import ContextWrapper from "./components/app-context";
import { router } from "./router";

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ContextWrapper>
      <RouterProvider router={router} />
    </ContextWrapper>
  );
}
