import { fetchMovieDetails, reset } from "@/redux/slices/moviesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { saveMovie } from "@/services/saveMovie";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

export type FilmesStates = ReturnType<typeof useFilmesStates>;
export default function useFilmesStates() {
  const [mensagem, setMensagem] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { movieDetails, loading, error, message } = useSelector((state: RootState) => state.movies);
  const { id } = useParams();
  const router = useRouter();

  const handleModalClose = () => setIsModalOpen(false);

  useEffect(() => {
    if (id && typeof id === "string")
      dispatch(fetchMovieDetails(id));

    return () => {
      console.log('Cleaning up useFilmesStates');
      dispatch(reset()); // Reseta o estado quando o componente é desmontado
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (error) {
      router.push('/not-found'); // Redireciona para a página de não encontrado em caso de erro
    }
  }, [error]);

  const handleSave = () => {
    if (!movieDetails) return;
    const salvo = saveMovie(movieDetails.id, movieDetails.title);
    if (salvo) {
      setMensagem('Filme salvo na sua lista!');
    } else {
      setMensagem('Filme já está salvo na sua lista!');
    }
    setIsModalOpen(true);
  };

  return {
    movieDetails, loading, error, message,
    id,
    handleSave,
    mensagem,
    isModalOpen,
    handleModalClose
  };
}
