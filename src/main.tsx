import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import "./App.css";
import ContextWrapper from "./components/app-context";
import { routeTree } from "./routeTree.gen";

const rootElement = document.getElementById("root")!;
const queryClient = new QueryClient();

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
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
