import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { SettingsProvider, useSettings } from './hooks/useSettings';
import { IntlProvider } from 'react-intl';
import en from '../i18n/en.json';
import es from '../i18n/es.json';

const messages: Record<string, Record<string, string>> = { en, es };

function Providers() {
  const { settings } = useSettings();
  return (
    <IntlProvider key={settings.language} locale={settings.language} messages={messages[settings.language]}>
      <ErrorBoundary>
        <App />
        <Toaster position="top-right" />
      </ErrorBoundary>
    </IntlProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <Providers />
    </SettingsProvider>
  </React.StrictMode>
);
