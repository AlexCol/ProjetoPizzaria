import api from '@/services/api';
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
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
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
  status: 'idle',
  message: ''
}

//************************************************************************
//* Criando Thunks para o slice de autenticação
// Thunks podem ser adicionados aqui, se precisar de operações assíncronas, 
// por exemplo, chamadas de API. Cada thunk pode gerenciar seus próprios 
// estados de carregamento, sucesso e erro nos extraReducers abaixo.
//************************************************************************
export const me = createAsyncThunk<MeResponse, void, { rejectValue: string }>(
  'user/me',
  async (_, { rejectWithValue }) => {

    try {
      const data = await api({ //'api' retorna já os dados
        method: 'get',
        url: '/users/me'
      });

      return data;
    } catch (error) {
      let errMessage = 'Erro ao buscar usuário';
      if (error instanceof Error)
        errMessage = error.message;

      if (errMessage === 'Token not found')
        errMessage = '';

      return rejectWithValue(errMessage);
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
    userReset: (state) => {
      state.meResponse = null
      state.status = 'idle';
      state.message = '';
    },
    userClearMessage: (state) => {
      state.message = '';
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => { //melhor usados para ações assíncronas, como o loginUsers
    builder
      .addCase(me.pending, (state) => {
        state.status = 'loading';
        state.message = '';
      })
      .addCase(me.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.meResponse = action.payload
        state.message = action.payload.email + ' carregado com sucesso'
      })
      .addCase(me.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload || '';
      })
  }
})

export const { userReset, userClearMessage } = userSlice.actions;

const userReducer = userSlice.reducer
export default userReducer;

