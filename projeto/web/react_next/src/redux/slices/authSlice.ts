// authSlice.ts
import api from '@/services/api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

//************************************************************************
//* Criando os tipos para o estado de autenticação
//************************************************************************
export type AuthResponse = {
  message: string;
  accessToken: string;
  refreshToken: string;
  origin: string;
}

type AuthState = {
  authResponse: AuthResponse | null;
  error: boolean;
  success: boolean;
  loading: boolean;
  message: string;
}

//************************************************************************
//* Criando os tipos usados nos Thunks
//* UserLogin é o tipo do objeto que será passado como parâmetro para a ação de login
//************************************************************************
type UserLogin = {
  email: string;
  password: string;
}

type RefreshToken = {
  refreshToken: string;
}

//************************************************************************
//* Declarando o estado inicial do slice de autenticação
//************************************************************************
const initialState: AuthState = {
  authResponse: null,
  error: false,
  success: false,
  loading: false,
  message: ''
}

//************************************************************************
//* Criando Thunks para o slice de autenticação
// Thunks podem ser adicionados aqui, se precisar de operações assíncronas, 
// por exemplo, chamadas de API. Cada thunk pode gerenciar seus próprios 
// estados de carregamento, sucesso e erro nos extraReducers abaixo.
//************************************************************************

//tipagens dentro de <>: 
// AuthResponse: dados que serão retornados se a ação for bem-sucedida;
// UserLogin: tipo do parâmetro que a função recebe;
// { rejectValue: string }: tipo do valor que será passado para rejectWithValue em caso de erro.
export const login = createAsyncThunk<AuthResponse, UserLogin, { rejectValue: string }>(
  'auth/login', // nome da ação, pode ser qualquer string, só não pode ser repetida entre Thunks
  async (params, { rejectWithValue }) => { //não precisa tipar params, pois foi tipado na definição do thunk
    const { email, password } = params;
    try {
      const data = await api({ //'api' retorna já os dados
        method: 'post',
        url: '/auth/login',
        data: { email, password }
      })

      return data;
    } catch (error) { //erro é tratado na 'api', vem como erro generico por conveniência
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
)

export const refresh = createAsyncThunk<AuthResponse, RefreshToken, { rejectValue: string }>(
  'auth/refresh', // nome da ação, pode ser qualquer string, só não pode ser repetida entre Thunks
  async (params, { rejectWithValue }) => { //não precisa tipar params, pois foi tipado na definição do thunk
    const { refreshToken } = params;
    try {
      const data = await api({
        method: 'post',
        url: '/auth/refresh',
        data: { refreshToken }
      });

      return data;
    } catch (error) { //erro é tratado na 'api', vem como erro generico por conveniência
      let errorMessage = 'Erro desconhecido';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
)

//************************************************************************
//* Criando o slice de autenticação
//************************************************************************
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { //melhor usados para ações síncronas e simples, como esse reset que limpa o estado
    reset: (state) => {
      state.authResponse = null
      state.error = false
      state.success = false
      state.loading = false
      state.message = ''
    },
  },
  extraReducers: (builder) => { //melhor usados para ações assíncronas, como o loginUsers
    builder
      .addCase(login.pending, (state) => {
        console.log('login pending')
        state.loading = true
        state.error = false
        state.success = false
        state.message = ''
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log('login fulfilled')
        state.loading = false
        state.success = true
        state.authResponse = action.payload
        state.message = action.payload.message
      })
      .addCase(login.rejected, (state, action) => {
        console.log('login rejected')
        state.loading = false
        state.error = true
        state.success = false
        state.message = action.payload || 'Erro ao fazer login'
      })
      .addCase(refresh.pending, (state) => {
        state.loading = true
        state.error = false
        state.success = false
        state.message = ''
      })
      .addCase(refresh.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.authResponse = action.payload
        state.message = action.payload.message
      })
      .addCase(refresh.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.success = false
        state.message = action.payload || 'Erro ao renovar token'
      })
  }
})

export const { reset } = authSlice.actions;

const authReducer = authSlice.reducer
export default authReducer;

