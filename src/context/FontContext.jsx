import { createContext, useContext, useEffect, useState } from "react";

const FontContext = createContext();

const corporateFonts = {
  system: {
    key: "system",
    label: "System UI",
    css: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    className: "font--system",
    google: null,
  },
  inter: {
    key: "inter",
    label: "Inter",
    css: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif`,
    className: "font--inter",
    google:
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  roboto: {
    key: "roboto",
    label: "Roboto",
    css: `"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--roboto",
    google:
      "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap",
  },
  openSans: {
    key: "openSans",
    label: "Open Sans",
    css: `"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--open-sans",
    google:
      "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap",
  },
  lato: {
    key: "lato",
    label: "Lato",
    css: `"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--lato",
    google:
      "https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap",
  },
  poppins: {
    key: "poppins",
    label: "Poppins",
    css: `"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--poppins",
    google:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap",
  },
  nunito: {
    key: "nunito",
    label: "Nunito Sans",
    css: `"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--nunito",
    google:
      "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;600;700&display=swap",
  },
  sourceSans: {
    key: "sourceSans",
    label: "Source Sans Pro",
    css: `"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif`,
    className: "font--source-sans",
    google:
      "https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;600;700&display=swap",
  },
};

export const FontProvider = ({ children }) => {
  const getInitial = () => localStorage.getItem("appFont") || "system";
  const [fontKey, setFontKey] = useState(getInitial);

  useEffect(() => {
    const font = corporateFonts[fontKey] || corporateFonts.system;

    document.documentElement.style.setProperty("--app-font", font.css);

    Object.values(corporateFonts).forEach((f) =>
      document.documentElement.classList.remove(f.className)
    );
    document.documentElement.classList.add(font.className);

    const prev = document.getElementById("app-font-link");
    if (prev) prev.remove();

    if (font.google) {
      const link = document.createElement("link");
      link.id = "app-font-link";
      link.rel = "stylesheet";
      link.href = font.google;
      document.head.appendChild(link);
    }

    localStorage.setItem("appFont", fontKey);
  }, [fontKey]);

  const changeFont = (key) => {
    if (!corporateFonts[key]) return;
    setFontKey(key);
  };

  return (
    <FontContext.Provider
      value={{
        currentFont: corporateFonts[fontKey],
        fontKey,
        corporateFonts,
        changeFont,
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => useContext(FontContext);
