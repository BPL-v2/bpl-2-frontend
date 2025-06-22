import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import ContextWrapper from "./components/app-context";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root")!;
const qc = new QueryClient();
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={qc}>
      <ContextWrapper>
        <RouterProvider router={router} />
      </ContextWrapper>{" "}
    </QueryClientProvider>
  );
}
