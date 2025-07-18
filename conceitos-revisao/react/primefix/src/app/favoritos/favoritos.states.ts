import { getSavedMovies, removeMovie } from "@/services/saveMovie";
import { useEffect, useState } from "react";

export default function useFavoritosStates() {
  const [favMovies, setFavMovies] = useState<FavMovies>([]);

  const handleRemove = (id: number) => {
    removeMovie(id);
    setFavMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
  };

  useEffect(() => {
    const savedMovies = getSavedMovies();
    setFavMovies(savedMovies);
  }, []);

  return {
    favMovies, setFavMovies,
    handleRemove
  };
}