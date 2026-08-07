import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="flex min-h-screen items-center justify-center bg-[#0F0C1B] text-white">
      <p>Biolink Cyberpunk v2</p>
    </div>
  </StrictMode>
);
