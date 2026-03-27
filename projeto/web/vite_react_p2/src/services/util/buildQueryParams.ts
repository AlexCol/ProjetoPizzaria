export type QueryParams = {
  where?: {
    field: string;
    value: any;
  }[];
  ordernation?: {
    orderField: string;
    orderDirection: 'asc' | 'desc';
  };
  paginations?: {
    page?: number;
    limit?: number;
  };
};

export default function buildQueryParams(params?: QueryParams): string {
  if (!params) return '';

  //!paginacao
  const { page, limit } = params?.paginations || {};
  let urlParams = '';
  if (page !== undefined) {
    urlParams += `page=${page}&`;
  }
  if (limit !== undefined) {
    urlParams += `limit=${limit}&`;
  }

  //!ordenação
  const { orderField, orderDirection } = params?.ordernation || {};
  if (orderField && orderDirection) {
    urlParams += `order-field=${orderField}&order-direction=${orderDirection}&`;
  }

  //!filtro
  for (const condition of params?.where || []) {
    const { field, value } = condition;
    if (field && value !== undefined) {
      urlParams += `${field}=${encodeURIComponent(value)}&`;
    }
  }

  if (urlParams) {
    urlParams = `?${urlParams.slice(0, -1)}`; // Remove o '&' final e adiciona '?'
  }
  return urlParams;
}
