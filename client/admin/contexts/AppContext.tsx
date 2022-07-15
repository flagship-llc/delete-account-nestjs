import React, { createContext, useContext } from 'react';
import createApp from '@shopify/app-bridge';
import axios from 'axios';
import { Redirect } from '@shopify/app-bridge/actions';
import { getSessionToken } from '@shopify/app-bridge-utils';

const app = createApp({
  apiKey: window['apiKey'],
  host: window['host'],
});
const ShopifyRedirect = Redirect.create(app);
const instance = axios.create();
instance.interceptors.request.use(function (config) {
  return getSessionToken(app).then((token) => {
    config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  });
});
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.data.authUrl)
      ShopifyRedirect.dispatch(
        Redirect.Action.REMOTE,
        error.response.data.authUrl,
      );
    return error.response;
  },
);

const AppContext = createContext(instance);

export const useAppContext = () => useContext(AppContext);

const AppContextProvider = ({ children }) => (
  <AppContext.Provider value={instance}>{children}</AppContext.Provider>
);

export default AppContextProvider;
