import { fetchMovieDetails, reset } from "@/redux/slices/moviesSlice";
import { AppDispatch, RootState } from "@/redux/store";
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
  }, [error])

  return {
    movieDetails, loading, error, message,
    id,
  };
}
