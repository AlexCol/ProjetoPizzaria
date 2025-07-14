// authSlice.ts
import { MovieApiResponse } from '@/model/MovieApiResponse.model';
import api from '@/services/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'

//************************************************************************
//* Criando os tipos para o estado do slice
//************************************************************************
import { Movie } from '@/model/Movie.model';

type MoviesState = {
  moviesData: MovieApiResponse | null;
  error: boolean;
  success: boolean;
  loading: boolean;
  message: string;
}

//************************************************************************
//* Declarando o estado inicial do slice de filmes
//************************************************************************
const initialState: MoviesState = {
  moviesData: null,
  error: false,
  success: false,
  loading: false,
  message: ''
}

//************************************************************************
//* Criando Thunks para o slice
// Thunks podem ser adicionados aqui, se precisar de operações assíncronas, 
// por exemplo, chamadas de API. Cada thunk pode gerenciar seus próprios 
// estados de carregamento, sucesso e erro nos extraReducers abaixo.
//************************************************************************
//tipagens dentro de <>: 
// MoviesResponse: dados que serão retornados se a ação for bem-sucedida;
// number: tipo do parâmetro que será passado para a função thunk;
// { rejectValue: string }: tipo do valor que será passado para rejectWithValue em caso de erro.
export const fetchPopularMovies = createAsyncThunk<MovieApiResponse, number, { rejectValue: string }>(
  'movies/popular', // nome da ação, pode ser qualquer string, só não pode ser repetida entre Thunks
  async (page, { rejectWithValue }) => { //não precisa tipar params, pois foi tipado na definição do thunk
    console.log('🔄 Executando fetchPopularMovies com page:', page);
    //await new Promise(res => setTimeout(res, 2000));
    try {
      const response = await api.get<MovieApiResponse>('/movie/popular', { page });
      return response;
    } catch (error) {
      console.error('Failed to fetch filmes:', error);
      return rejectWithValue('Failed to fetch filmes');
    }
  }
)

//************************************************************************
//* Criando o slice de filmes
//************************************************************************
const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: { //melhor usados para ações síncronas e simples, como esse reset que limpa o estado
    reset: (state) => {
      state.moviesData = null
      state.error = false
      state.success = false
      state.loading = false
      state.message = ''
    },
  },
  extraReducers: (builder) => { //melhor usados para ações assíncronas, como o loginUsers
    builder
      .addCase(fetchPopularMovies.pending, (state) => {
        console.log('🔄 fetchPopularMovies pendente');
        state.loading = true
        state.error = false
        state.success = false
        state.message = ''
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.moviesData = action.payload
        state.message = 'Filmes carregados com sucesso!'
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.success = false
        state.message = action.payload || 'Erro ao carregar filmes'
      })
  }
})

export const { reset } = moviesSlice.actions;

const moviesReducer = moviesSlice.reducer
export default moviesReducer;

