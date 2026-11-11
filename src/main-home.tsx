import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { I18nProvider } from "./i18n/I18nProvider";
import { HomeApp } from "./app/HomeApp";
import "./styles/main.css";
import "./styles/home.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nProvider>
      <HomeApp />
    </I18nProvider>
  </StrictMode>,
);
