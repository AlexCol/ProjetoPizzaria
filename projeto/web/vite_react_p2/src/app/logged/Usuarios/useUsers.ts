import { useEffect, useRef, useState, type RefObject, type SubmitEventHandler } from 'react';
import { toast } from 'sonner';
import useQuerable from '@/components/singles/DataTable/hooks/useQuerable';
import type { CreateUserDto, ResponseUserDto, UpdateUserDto } from '@/services/generated/models';
import { getRoles } from '@/services/generated/roles/roles';
import { getUsers } from '@/services/generated/users/users';
import Logger from '@/utils/Logger';

export default function useUsers() {
  //?????????????????????????????????????????????????????????????????????????????????
  //? Estados
  //?????????????????????????????????????????????????????????????????????????????????
  const { getApiUsersSearch, postApiUsers, patchApiUsersId } = getUsers();
  const query = useQuerable<ResponseUserDto>({ searcher: getApiUsersSearch as any });
  const { dados: dadosUsuarios, isLoading, loadData, datatableServerSideManager } = query;
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);

  //status para controle (salvando e carregando)
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const disableButtons = isLoading || isSaving;

  //controle do modal
  const [mode, setMode] = useState<'edit' | 'create'>('create');
  const [isModalOpen, setIsModalOpen] = useState(false);

  //refs para criação de usuario
  const emailRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const nameRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const passwordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const confirmPasswordRef = useRef<HTMLInputElement>(null) as RefObject<HTMLInputElement>;
  const roleIdRef = useRef<HTMLSelectElement>(null) as RefObject<HTMLSelectElement>;

  //refs para atualização/criação de setor
  const idRef = useRef<string>('');
  const emailPendingRef = useRef<string>('');
  const namePendingRef = useRef<string>('');
  const roleIdPendingRef = useRef<string>('');

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos Publicos
  //?????????????????????????????????????????????????????????????????????????????????
  function handleModalClose() {
    clearRefs();
    setIsModalOpen(false);
  }

  async function openModalNovo() {
    setIsModalOpen(true);
    await loadRoles();
    setMode('create');
  }

  async function openModalEditar(usuario: ResponseUserDto) {
    await loadRoles();
    idRef.current = String(usuario.id);
    emailPendingRef.current = usuario.email ?? '';
    namePendingRef.current = usuario.name ?? '';
    roleIdPendingRef.current = String(usuario.role?.id ?? '');
    setMode('edit');
    setIsModalOpen(true);
  }

  const signUpHandler: SubmitEventHandler<HTMLFormElement> = async (ev) => {
    ev.preventDefault();

    let processed = false;
    setIsSaving(true);

    if (mode === 'create') {
      const usuario = {
        email: emailRef.current?.value,
        name: nameRef.current?.value,
        password: passwordRef.current?.value,
        confirmPassword: confirmPasswordRef.current?.value,
        roleId: roleIdRef.current?.value,
      } satisfies CreateUserDto;

      if (!isUserDataValid(usuario)) {
        setIsSaving(false);
        return;
      }

      processed = await handleNovoUsuario(usuario);
    } else if (mode === 'edit') {
      const usuario = {
        name: nameRef.current?.value,
        roleId: roleIdRef.current?.value,
      } satisfies UpdateUserDto;

      processed = await handleEditarUsuario(idRef.current, usuario);
    }

    setIsSaving(false);
    if (processed) {
      void loadData(false);
    }
    handleModalClose();
  };

  //?????????????????????????????????????????????????????????????????????????????????
  //? Metodos Privados
  //?????????????????????????????????????????????????????????????????????????????????
  async function handleNovoUsuario(usuario: CreateUserDto): Promise<boolean> {
    try {
      await postApiUsers(usuario);
      toast.success('Usuário criado com sucesso. Enviado email para ativação da conta.');
      return true;
    } catch (error) {
      toast.error('Erro ao criar usuário: ' + (error instanceof Error ? error.message : ''));
      Logger.error('useConfigUsuarios - handleNovoUsuario', error);
      return false;
    }
  }

  function isUserDataValid(usuario: CreateUserDto) {
    if (usuario.password !== usuario.confirmPassword) {
      toast.error('As senhas não coincidem.');
      return false;
    }
    return true;
  }

  async function handleEditarUsuario(userId: string, usuario: UpdateUserDto) {
    try {
      if (!isUserUpdateDataValid(usuario)) {
        toast.error('Nenhum dado alterado.');
        return false;
      }
      await patchApiUsersId(userId, usuario);
      toast.success('Usuário editado com sucesso.');
      return true;
    } catch (error) {
      toast.error('Erro ao editar usuário: ' + (error instanceof Error ? error.message : ''));
      Logger.error('useConfigUsuarios - handleEditarUsuario', error);
      return false;
    }
  }

  function isUserUpdateDataValid(usuario: UpdateUserDto) {
    if (usuario.name === namePendingRef.current && usuario.roleId === roleIdPendingRef.current) {
      return false;
    }
    return true;
  }

  function clearRefs() {
    if (emailRef.current) emailRef.current.value = '';
    if (nameRef.current) nameRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';
    if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
    if (roleIdRef.current) roleIdRef.current.value = '';
  }

  async function loadRoles() {
    if (roleOptions.length > 1) return; //ja carregou
    try {
      const response = await getRoles().getApiRolesSearch();

      const roleOptions = (response.data || [])
        .filter((role) => role.id !== null && role.id !== undefined)
        .map((role) => ({
          label: role.name ?? 'Sem nome',
          value: String(role.id),
        }));

      setRoleOptions(roleOptions);
    } catch (error) {
      toast.error('Erro ao carregar cargos: ' + (error instanceof Error ? error.message : ''));
      Logger.error('useConfigUsuarios - loadRoles', error);
    }
  }

  //?????????????????????????????????????????????????????????????????????????????????
  //? useEffects
  //?????????????????????????????????????????????????????????????????????????????????
  useEffect(() => {
    if (isModalOpen && mode === 'edit') {
      if (emailRef.current) {
        emailRef.current.value = emailPendingRef.current;
      }
      if (nameRef.current) {
        nameRef.current.value = namePendingRef.current;
      }
      if (roleIdRef.current) {
        roleIdRef.current.value = roleIdPendingRef.current;
      }
    }
  }, [isModalOpen, mode]);

  return {
    //estados
    dadosUsuarios: dadosUsuarios?.data,
    isSaving,
    isLoading,
    disableButtons,

    //para uso do modal
    isModalOpen,
    handleModalClose,

    //refs - modal
    emailRef,
    nameRef,
    passwordRef,
    confirmPasswordRef,
    roleIdRef,
    signUpHandler,
    roleOptions,
    mode,

    //metodos para pagina
    openModalNovo,
    openModalEditar,

    //controle dataTable server-side
    datatableServerSideManager,
  };
}

export type UsersStates = {
  states: ReturnType<typeof useUsers>;
};
