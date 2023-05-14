import type { AxiosRequestConfig } from 'axios';

export interface ExtendableParameters {
  [_prop: string]: unknown;
}

export interface Parameters extends ExtendableParameters {
  url?: string;
  extensions?: string[];
  request?: AxiosRequestConfig;
  debug?: boolean;
}

export const defaultParameters: Parameters = {
  url: undefined,
  extensions: undefined,
  request: undefined,
  debug: false
};
