import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./App.css";
import ContextWrapper from "./components/app-context";
import { router } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const rootElement = document.getElementById("root")!;
const queryClient = new QueryClient();
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <ContextWrapper>
        <RouterProvider router={router} />
      </ContextWrapper>{" "}
    </QueryClientProvider>
  );
}
