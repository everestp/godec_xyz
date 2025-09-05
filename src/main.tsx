import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import AppWalletProvider from "./components/AppWalletProvider.tsx";
import { DataContextProvider } from "./context/DataContext.tsx";

// Node polyfills (global, load once)
import process from "process";
import { Buffer } from "buffer";

window.global = window;
window.process = process;
window.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(
  <DataContextProvider>
    <AppWalletProvider>
      <App />
    </AppWalletProvider>
  </DataContextProvider>
);
