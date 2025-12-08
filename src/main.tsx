import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Theme } from "@radix-ui/themes";
import { App } from "./App";
import "@radix-ui/themes/styles.css";
import "./index.css";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <Theme appearance="dark" accentColor="violet" grayColor="slate" radius="large" scaling="100%">
        <App />
      </Theme>
    </ConvexProvider>
  </StrictMode>
);
