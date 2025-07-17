import { MovieDetails } from "@/model/MovieDetails";

export default async function saveMovie(movieDetails: MovieDetails | null) {
  if (!movieDetails) return;

  const minhaLista = localStorage.getItem('@primeFix');
  const filmesSalvos: FavMovies = minhaLista ? JSON.parse(minhaLista) : [];
  const filmeExistente = filmesSalvos.find(filme => filme.id === movieDetails.id);

  if (filmeExistente) {
    alert('Filme já está salvo na sua lista!');
    return;
  }

  const novoFilme: FavMovie = {
    id: movieDetails.id,
    title: movieDetails.title,
  };
  filmesSalvos.push(novoFilme);
  localStorage.setItem('@primeFix', JSON.stringify(filmesSalvos));
  alert('Filme salvo na sua lista!');
}