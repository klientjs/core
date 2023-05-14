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
export declare const defaultParameters: Parameters;
