

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useTranslationDebug } from "./TranslationDebugContext";
import { ErrorModal } from '../components/ErrorModal.jsx';

export const SUPPORTED_LANGUAGES = ["ar", "en", "hi", "zh", "pt", "en-GB", "fr", "es", "tr", "it"] as const;
export const SUPPORTED_CURRENCIES = ["USD", "SAR", "EUR", "JPY", "GBP", "INR", "USDT", "CAD", "CHF"] as const;

type LangCode = (typeof SUPPORTED_LANGUAGES)[number];
type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

// Helper to get language from localStorage or default
const getInitialLanguage = (): LangCode => {
    try {
        const storedLang = localStorage.getItem('language');
        if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as LangCode)) {
            return storedLang as LangCode;
        }
    } catch (e) {
        console.error("Could not access localStorage for language preference.", e);
    }
    return 'ar'; // Default language
};

const getInitialCurrency = (): CurrencyCode => {
    try {
        const storedCurr = localStorage.getItem('currency');
        if (storedCurr && SUPPORTED_CURRENCIES.includes(storedCurr as CurrencyCode)) {
            return storedCurr as CurrencyCode;
        }
    } catch (e) {
        console.error("Could not access localStorage for currency preference.", e);
    }
    return 'USD'; // Default currency
};

type Translations = { [key: string]: any };

type LanguageContextValue = {
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
  t: (key: string, replacements?: Record<string, string | number>) => any;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

type ProviderProps = { children?: ReactNode };

export const LanguageProvider = ({ children }: ProviderProps) => {
  const [language, setLanguageState] = useState<LangCode>(getInitialLanguage);
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency);
  const [translations, setTranslations] = useState<Record<string, Translations | null>>({ ar: null, en: null, hi: null, zh: null, pt: null, "en-GB": null, fr: null, es: null, tr: null, it: null });
  const [criticalError, setCriticalError] = useState<{ messageKey: string; details: string } | null>(null);
  const { addMissingKey } = useTranslationDebug();

  const setLanguage = (lang: LangCode) => {
      try {
          localStorage.setItem('language', lang);
      } catch (e) {
          console.error("Could not save language preference to localStorage.", e);
      }
      setLanguageState(lang);
  };

  const setCurrency = (curr: CurrencyCode) => {
      try {
          localStorage.setItem('currency', curr);
      } catch (e) {
          console.error("Could not save currency preference to localStorage.", e);
      }
      setCurrencyState(curr);
  };

  const loadTranslations = useCallback(async (lang: LangCode) => {
    // Avoid re-fetching if already loaded
    if (translations[lang]) return;

    try {
      const response = await fetch(`/i18n/locales/${lang}/common.json`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`File not found for language '${lang}'.`);
        }
        throw new Error(`Failed to load '${lang}' translations. Status: ${response.status}`);
      }
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        setTranslations(prev => ({ ...prev, [lang]: data }));
      } catch (jsonError) {
        throw new Error(`Invalid JSON format in translation file for language '${lang}'.`);
      }
    } catch (error: any) {
      console.error("Translation loading error:", error);
      
      let messageKey = 'error_translation_unknown';
      if (error.message.includes('File not found')) {
        messageKey = 'error_translation_file_not_found';
      } else if (error.message.includes('Invalid JSON')) {
        messageKey = 'error_translation_invalid_json';
      } else if (error instanceof TypeError) { // Often indicates network errors
        messageKey = 'error_translation_network_error';
      }
      
      // If the essential base language ('ar') fails, it's a critical, unrecoverable error.
      if (lang === 'ar') {
        setCriticalError({ messageKey, details: error.message });
      } else {
        // Otherwise, attempt to load the default fallback.
        loadTranslations('ar');
      }
    }
  }, [translations]);

  useEffect(() => {
    // Always load Arabic as the base
    loadTranslations('ar');
    // Load the current language if it's not Arabic
    if (language !== 'ar') {
      loadTranslations(language);
    }
  }, [language, loadTranslations]);

  useEffect(() => {
    document.documentElement.lang = language;
    const dir = (translations[language] as any)?.lang_direction === "rtl" ? "rtl" : "ltr";
    document.documentElement.dir = dir;
  }, [language, translations]);

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    if (!key) return "";

    const findTranslation = (dict: Translations | null, translationKey: string): any => {
      if (!dict) return undefined;
      const keys = translationKey.split(".");
      let result: any = dict;
      for (const k of keys) {
        result = result?.[k];
        if (result === undefined) return undefined;
      }
      return result;
    };

    // Try finding in the current language
    let translation = findTranslation(translations[language], key);
    
    // Fallback to Arabic if not found
    if (translation === undefined && language !== "ar") {
      translation = findTranslation(translations['ar'], key);
    }
    
    // If the key exists but its value is null, treat it as missing.
    // Also log if the key is completely undefined.
    if (translation === undefined || translation === null) {
      addMissingKey(key);
      return key;
    }

    if (typeof translation === "string" && replacements) {
      return Object.entries(replacements).reduce((acc, [rk, rv]) => {
        const pattern = new RegExp(`\\{${rk}\\}`, "g");
        return acc.replace(pattern, String(rv));
      }, translation as string);
    }

    return translation;
  }, [language, translations, addMissingKey]);

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t,
    currency,
    setCurrency,
  };

  if (criticalError) {
      return (
        <LanguageContext.Provider value={value}>
            <ErrorModal error={criticalError} />
        </LanguageContext.Provider>
      );
  }

  const isReady = translations[language] && translations.ar;

  return (
    <LanguageContext.Provider value={value}>
      {isReady ? children : null /* Or a loading spinner */}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};