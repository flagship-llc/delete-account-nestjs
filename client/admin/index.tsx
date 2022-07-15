import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './app.css';
import jaTranslations from '@shopify/polaris/locales/ja.json';
import { AppProvider, Frame } from '@shopify/polaris';
import { Provider } from '@shopify/app-bridge-react';
import '@shopify/polaris/dist/styles.css';
import Dashboard from './components/Dashboard';
import AppContextProvider from './contexts/AppContext';

const config = {
  apiKey: window['apiKey'],
  shopOrigin: window['shopOrigin'],
  host: window['host'],
};

ReactDOM.render(
  <Router>
    <AppContextProvider>
      <AppProvider i18n={jaTranslations}>
        <Provider config={config}>
          <Frame>
            <Routes>
              <Route path="/" element={Dashboard} />
            </Routes>
          </Frame>
        </Provider>
      </AppProvider>
    </AppContextProvider>
  </Router>,

  document.querySelector('#root'),
);
