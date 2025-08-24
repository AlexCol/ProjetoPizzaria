'use client'
import CheckBoxGroup from '@/components/singles/CheckBoxGroup';
import LogoImage from '@/components/singles/LogoImage';
import PasswordInput from '@/components/singles/PasswordInput';
import Link from 'next/link';
import { signUpStyles } from './signup.styles';
import useSignUp from './useSignUp';

function SignUp() {
  const states = useSignUp();

  return (
    <div className={signUpStyles.container}>
      <LogoImage />

      <div className={signUpStyles.title}>
        Cadastre-se
      </div>
      <section className={signUpStyles.signUp}>
        <form onSubmit={states.signUpHandler} className={signUpStyles.form}>
          <input
            className={signUpStyles.input}
            type="name"
            placeholder="Nome"
            ref={states.nameRef}
            autoComplete="name"
            disabled={states.isLoading}
            required
          />
          <input
            className={signUpStyles.input}
            type="email"
            placeholder="Email"
            ref={states.emailRef}
            autoComplete="off"
            disabled={states.isLoading}
            required
          />

          {/* inputs com opção de revelar a senha */}
          <PasswordInput
            inputClassName={signUpStyles.input}
            placeholder="Password"
            autoComplete="new-password"
            inputRef={states.passwordRef}
            isLoading={states.isLoading}
          />
          <PasswordInput
            inputClassName={signUpStyles.input}
            placeholder="Confirm Password"
            autoComplete="new-password"
            inputRef={states.confirmPasswordRef}
            isLoading={states.isLoading}
          />
          {/* inputs com opção de revelar a senha */}

          {/* checkboxes */}
          <CheckBoxGroup
            itens={states.possiblePermissions}
            handleChange={states.handlePermissionChange}
            isLoading={states.isLoading}
            currentList={states.permissions}
          />
          {/* checkboxes */}

          <button
            type="submit"
            disabled={states.isLoading}
            className={signUpStyles.button}
          >
            {states.isLoading ? 'Loading...' : 'SignUp'}
          </button>
        </form>

        {/* Link to login page com disabled */}
        {states.isLoading ? (
          <span className={`${signUpStyles.link} opacity-60 cursor-not-allowed`} aria-disabled="true">
            Já tem uma conta? Faça login
          </span>
        ) : (
          <Link href="/auth/login" className={signUpStyles.link}>
            Já tem uma conta? Faça login
          </Link>
        )}
        {/* Link to login page com disabled */}

      </section>
      {states.errorMessage && <div className="text-red-500">{states.errorMessage}</div>}
      {states.message && <div className="text-green-500">{states.message}</div>}
    </div>
  );
}

export default SignUp