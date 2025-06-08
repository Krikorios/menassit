import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// i18n config is now imported in App.tsx

console.log("🚀 Main.tsx is loading...");

const rootElement = document.getElementById("root");
console.log("📍 Root element:", rootElement);

if (rootElement) {
  console.log("✅ Root element found, creating React root...");
  const root = createRoot(rootElement);
  console.log("✅ React root created, rendering App...");
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log("✅ App rendered!");
} else {
  console.error("❌ Root element not found!");
}
