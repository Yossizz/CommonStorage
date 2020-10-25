export interface IElasticRequestConfig {
  from: number;
  size: number;
}

export interface IError {
  status: number;
  type: string;
  reason: string;
}
