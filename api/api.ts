import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getTimeZone } from '@/utils/time';

export { http };

interface HttpArguments {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  // params?: Record<string, string | undefined>;
  params?: URLSearchParams;
  dataWithFiles?: boolean;
}

const http = async <T>({
  path,
  method = 'POST',
  data = {},
  params = new URLSearchParams(),
  dataWithFiles = false,
}: HttpArguments): Promise<T> => {
  let jwt;
  if (Platform.OS === 'web') {
    try {
      if (typeof localStorage !== 'undefined') {
        jwt = localStorage.getItem(
          process.env.EXPO_PUBLIC_TOKEN_SECRET ?? 'TOKEN_SECRET'
        );
      }
    } catch (e) {
      console.error('Local storage is unavailable:', e);
    }
  } else {
    jwt = await SecureStore.getItemAsync(
      process.env.EXPO_PUBLIC_TOKEN_SECRET ?? 'TOKEN_SECRET'
    );
  }

  for (const [key, value] of params) {
    if (!value) {
      params.delete(key);
    }
  }

  const url = `http://${process.env.EXPO_PUBLIC_API_URL}:${process.env.EXPO_PUBLIC_API_PORT}/api/${path}`;

  const request: AxiosRequestConfig = {
    method,
    params,
    data,
    url: url,
    headers: {
      Authorization: `Bearer ${jwt}`,
      Lang: 'es',
      'Time-Zone': getTimeZone(),
      'Content-Type': !dataWithFiles
        ? 'application/json'
        : 'multipart/form-data',
    },
    timeout: 20000,
  };

  let response: AxiosResponse<T, T>;

  response = await axios(request);

  return response.data;
};
