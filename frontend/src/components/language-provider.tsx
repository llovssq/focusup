import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "../lib/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations.ru, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "ru";
    const saved = localStorage.getItem("vela_lang");
    return (saved as Language) || "ru";
  });

  useEffect(() => {
    localStorage.setItem("vela_lang", language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof typeof translations.ru, params?: Record<string, any>) => {
    let text = translations[language][key] || translations.ru[key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
