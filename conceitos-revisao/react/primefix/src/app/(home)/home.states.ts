'use client';

import { fetchPopularMovies, reset } from "@/redux/slices/moviesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function useHomeStates() {
  const dispatch = useDispatch<AppDispatch>();
  const { moviesData, loading, error } = useSelector((state: RootState) => state.movies);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFilmes = async (page: number) => dispatch(fetchPopularMovies(page));
  const cleanUp = () => dispatch(reset());

  useEffect(() => {
    fetchFilmes(1);
    return () => {
      cleanUp();
    };
  }, []);

  useEffect(() => {
    if (moviesData) {
      setCurrentPage(moviesData.page);
    }
  }, [moviesData]);

  return {
    filmes: moviesData?.results || [],
    totalPages: 500, //moviesData?.total_pages || 0, //motivo de não usar o total de paginas, abaixo
    currentPage,
    loading,
    error,
    fetchFilmes
  }
}

export type HomeStates = ReturnType<typeof useHomeStates>;

//themoviedb só posso buscar até a pagina 500
//Invalid page: Pages start at 1 and max at 500. They are expected to be an integer.
//https://www.themoviedb.org/talk/54e9c6109251412eb1003cc0