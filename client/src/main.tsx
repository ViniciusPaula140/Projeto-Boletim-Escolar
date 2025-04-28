import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { eventBus } from "./lib/eventBus";

// Initialize polyfills for Angular
import 'zone.js';

// Initializing event bus for cross-framework communication
window.eventBus = eventBus;
window.angularLoaded = false;

// Setting up Angular initialization flag
const initAngular = async () => {
  try {
    // Import Angular core modules
    await import("@angular/core");
    await import("@angular/platform-browser-dynamic");
    await import("@angular/common");
    await import("@angular/forms");
    
    // Mark Angular as loaded
    window.angularLoaded = true;
    
    // Dispatch event for Angular ready
    document.dispatchEvent(new CustomEvent('angular-ready'));
    
    // Call any registered callbacks
    if (typeof window.onAngularReady === 'function') {
      window.onAngularReady();
    }
    
    console.log("Angular successfully initialized");
  } catch (e) {
    console.error("Error loading Angular:", e);
  }
};

// Initialize Angular
initAngular();

// Initialize React application
createRoot(document.getElementById("root")!).render(<App />);
