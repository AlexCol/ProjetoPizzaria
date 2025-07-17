import { MovieDetails } from "@/model/MovieDetails";

export function saveMovie(id: number, title: string): boolean {

  const minhaLista = localStorage.getItem('@primeFix');
  const filmesSalvos: FavMovies = minhaLista ? JSON.parse(minhaLista) : [];
  const filmeExistente = filmesSalvos.find(filme => filme.id === id);

  if (filmeExistente) {
    return false;
  }

  const novoFilme: FavMovie = { id, title };
  filmesSalvos.push(novoFilme);
  localStorage.setItem('@primeFix', JSON.stringify(filmesSalvos));
  return true;
}

export function removeMovie(movieId: number) {
  const minhaLista = getSavedMovies();
  const filmesSalvos: FavMovies = minhaLista.filter(filme => filme.id !== movieId);
  localStorage.setItem('@primeFix', JSON.stringify(filmesSalvos));
  //alert('Filme removido da sua lista!');
}

export function getSavedMovies(): FavMovie[] {
  const minhaLista = localStorage.getItem('@primeFix');
  return minhaLista ? JSON.parse(minhaLista) : [];
}