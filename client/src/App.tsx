import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { RTLProvider } from "./components/RTLProvider";
// Import i18n configuration
import "./i18n/config";

function App() {
  console.log("🎯 App component is rendering...");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("🎯 App component useEffect running...");
    setIsLoaded(true);
  }, []);

  return (
    <ThemeProvider>
      <RTLProvider>
        <AuthProvider>
          {isLoaded ? (
            <div className="app-container">
              <LandingPage />
            </div>
          ) : (
            <div className="loading">Loading...</div>
          )}
        </AuthProvider>
      </RTLProvider>
    </ThemeProvider>
  );
}

export default App;
