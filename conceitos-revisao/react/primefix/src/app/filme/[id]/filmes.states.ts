import { fetchMovieDetails, reset } from "@/redux/slices/moviesSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { saveMovie } from "@/services/saveMovie";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

export type FilmesStates = ReturnType<typeof useFilmesStates>;
export default function useFilmesStates() {
  const dispatch = useDispatch<AppDispatch>();
  const { movieDetails, loading, error, message } = useSelector((state: RootState) => state.movies);
  const { id } = useParams();
  const router = useRouter();

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
      alert('Filme salvo na sua lista!');
    } else {
      alert('Filme já está salvo na sua lista!');
    }
  };

  return {
    movieDetails, loading, error, message,
    id,
    handleSave
  };
}
