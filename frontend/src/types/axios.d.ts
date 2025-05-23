declare module 'axios' {
  interface AxiosRequestConfig {
    baseURL?: string;
    headers?: Record<string, string>;
    params?: any;
    data?: any;
    timeout?: number;
  }

  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
  }

  interface AxiosPromise<T = any> extends Promise<AxiosResponse<T>> {}

  interface AxiosInstance {
    defaults: {
      headers: {
        common: Record<string, string>;
      }
    };
    get<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosPromise<T>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): AxiosPromise<T>;
  }

  function create(config?: AxiosRequestConfig): AxiosInstance;
  
  const axios: AxiosInstance & {
    create: typeof create;
  };
  
  export default axios;
} 