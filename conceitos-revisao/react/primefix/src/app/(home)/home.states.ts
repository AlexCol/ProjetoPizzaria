'use client';

import { fetchPopularMovies } from "@/redux/slices/moviesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";

export default function useHomeStates() {
  const dispatch = useDispatch<AppDispatch>();
  const { moviesData, loading, error } = useSelector((state: RootState) => state.movies);

  const fetchFilmes = async (page: number) => dispatch(fetchPopularMovies(page));

  useEffect(() => {
    fetchFilmes(1);
  }, []);

  return {
    filmes: moviesData?.results || [],
    loading,
    error,
    fetchFilmes
  }
}

export type HomeStates = ReturnType<typeof useHomeStates>;