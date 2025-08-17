// authSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

//************************************************************************
//* Criando os tipos para o estado de autenticação
//************************************************************************
type MeResponse = {
  id: number;
  email: string;
  name: string;
  ativo: boolean;
  permissions: string[];
  criadoEm: Date;
  atualizadoEm: Date;
}

type UserState = {
  meResponse: MeResponse | null;
  error: boolean;
  success: boolean;
  loading: boolean;
  message: string;
}

//************************************************************************
//* Criando os tipos usados nos Thunks
//* UserLogin é o tipo do objeto que será passado como parâmetro para a ação de login
//************************************************************************
//!nenhum ainda

//************************************************************************
//* Declarando o estado inicial do slice de autenticação
//************************************************************************
const initialState: UserState = {
  meResponse: null,
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
export const me = createAsyncThunk<MeResponse, null, { rejectValue: string }>(
  'user/me',
  async (_, { rejectWithValue }) => {

    try {
      //await new Promise(resolve => setTimeout(resolve, 1000)); //realizar busca na api
      const userData = {
        id: 1,
        email: 'admin@admin.com',
        name: 'Admin',
        ativo: true,
        permissions: ['admin'],
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };

      return userData;
    } catch (error) {
      return rejectWithValue('Erro ao buscar usuário');
    }
  }
)

//************************************************************************
//* Criando o slice de autenticação
//************************************************************************
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: { //melhor usados para ações síncronas e simples, como esse reset que limpa o estado
    reset: (state) => {
      state.meResponse = null
      state.error = false
      state.success = false
      state.loading = false
      state.message = ''
    },
  },
  extraReducers: (builder) => { //melhor usados para ações assíncronas, como o loginUsers
    builder
      .addCase(me.pending, (state) => {
        state.loading = true
        state.error = false
        state.success = false
        state.message = ''
      })
      .addCase(me.fulfilled, (state, action) => {
        state.loading = false
        state.success = true
        state.meResponse = action.payload
        state.message = action.payload.email + ' carregado com sucesso'
      })
      .addCase(me.rejected, (state, action) => {
        state.loading = false
        state.error = true
        state.success = false
        state.message = action.payload || 'Erro ao carregar usuário'
      })
  }
})

export const { reset } = userSlice.actions;

const userReducer = userSlice.reducer
export default userReducer;

