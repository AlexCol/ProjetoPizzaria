import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { DataTableServerSideManager } from '../interfaces/DataTableProps';
import type { PaginatedDtoResponse } from '@/services/util/paginatedDtoResponse';
import type { QueryParams } from '@/services/util/QueryParams';
import Logger from '@/utils/Logger';

type Querable<T> = {
  searcher: (params?: QueryParams) => Promise<PaginatedDtoResponse<T>>;
};

export default function useQuerable<T>(querable: Querable<T>) {
  //status para controle de botes (salvando e carregando)
  const [firstLoad, setFirstLoad] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  //dados dos buscados
  const [dados, setDados] = useState<PaginatedDtoResponse<T> | undefined>(undefined);

  //controle de filtros
  const [filters, setFilters] = useState<{ field: string; value: any }[]>([]);

  //controle de ordenação
  const [orderField, setOrderField] = useState<string>('');
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');

  //controle de paginação (remover se decidir usar ela em client-side)
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [totalItems, setTotalItems] = useState<number>(0);

  const datatableServerSideManager: DataTableServerSideManager = {
    where: {
      filters: filters,
      onFiltersChange: setFilters,
    },
    ordernation: {
      sortField: orderField,
      sortDirection: orderDirection,
      onSortChange: (field: string, direction: 'asc' | 'desc') => {
        setOrderField(field);
        setOrderDirection(direction);
      },
    },
    pagination: {
      totalItems: totalItems,
      currentPage: page,
      pageSize: limit,
      pageSizeOptions: [10, 20, 30, 50],
      onPageChange: setPage,
      onPageSizeChange: setLimit,
    },
  };

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos Publicos
  //?????????????????????????????????????????????????????????????????????????????????
  async function loadData(setLoading: boolean = true) {
    if (setLoading) setIsLoading(true);
    try {
      const queryParams = {} as any;
      if (orderField) {
        queryParams['sort-field'] = orderField;
        queryParams['sort-order'] = orderDirection;
      }
      if (page) queryParams.page = page;
      if (limit) queryParams.limit = limit;

      if (filters.length > 0) {
        filters.forEach((filter) => {
          queryParams[filter.field] = filter.value;
        });
      }

      const dados = await querable.searcher(queryParams);
      setTotalItems(dados.total);
      setDados(dados);
    } catch (error) {
      toast.error(`Erro ao carregar dados. ${error}`);
      Logger.error(`useQuerable - loadData`, error);
    } finally {
      if (setLoading) setIsLoading(false);
    }
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      void loadData(true);
    } else {
      void loadData(false);
    }
  }, [page, limit, orderField, orderDirection, filters]);

  return {
    dados,
    isLoading,
    loadData,
    datatableServerSideManager,
  };
}
