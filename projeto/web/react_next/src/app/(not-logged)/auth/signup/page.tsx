'use client'
import Image from 'next/image';
import Link from 'next/link';
import { signUpStyles } from './signup.styles';
import useSignUp from './useSignUp';

function SignUp() {
  const states = useSignUp();

  return (
    <div className={signUpStyles.container}>
      <Image
        src="/images/logo3.png"
        alt="Pizzaria Coletti"
        title="Pizzaria Coletti"
        width={250}
        height={250}
        className={signUpStyles.logo}
        priority
      />
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
          <input
            className={signUpStyles.input}
            type="password"
            placeholder="Password"
            ref={states.passwordRef}
            autoComplete="new-password"
            disabled={states.isLoading}
            required
          />
          <input
            className={signUpStyles.input}
            type="password"
            placeholder="Confirm Password"
            ref={states.confirmPasswordRef}
            autoComplete="new-password"
            disabled={states.isLoading}
            required
          />

          {/* checkboxes */}
          <div className={signUpStyles.checkboxGroup}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                value="KITCHEN"
                checked={states.permissions.includes('KITCHEN')}
                onChange={states.handlePermissionChange}
                disabled={states.isLoading}
              />
              Cozinha
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                value="WAITRESS"
                checked={states.permissions.includes('WAITRESS')}
                onChange={states.handlePermissionChange}
                disabled={states.isLoading}
              />
              Garçom
            </label>
          </div>
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
      {states.errMessage && <div className="text-red-500">{states.errMessage}</div>}
    </div>
  );
}

export default SignUp