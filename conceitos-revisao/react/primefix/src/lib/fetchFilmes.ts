// lib/fetchFilmes.ts
import { MovieApiResponse } from "@/model/MovieApiResponse.model";
import api from "@/services/api";

export async function fetchFilmes() {
  const response = await api.get<MovieApiResponse>('/movie/popular');
  return response.results;
}
