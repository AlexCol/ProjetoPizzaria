import { getSavedMovies, removeMovie } from "@/services/saveMovie";
import { useEffect, useState } from "react";

export default function useFavoritosStates() {
  const [favMovies, setFavMovies] = useState<FavMovies>([]);
  const [idToRemove, setIdToRemove] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleClose = () => setIsModalOpen(false);

  const handleRemove = (id: number) => {
    removeMovie(id);
    setFavMovies(prevMovies => prevMovies.filter(movie => movie.id !== id));
    setIsModalOpen(false);
    setIdToRemove(0);
  };

  const handleConfirmRemove = (id: number) => {
    setIsModalOpen(true);
    setIdToRemove(id);
  };

  useEffect(() => {
    const savedMovies = getSavedMovies();
    setFavMovies(savedMovies);
  }, []);

  return {
    favMovies, setFavMovies,
    handleRemove,
    isModalOpen,
    idToRemove,
    handleConfirmRemove,
    handleClose
  };
}