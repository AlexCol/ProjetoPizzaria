'use client'
import Button from '@/components/singles/Button';
import CheckBoxGroup from '@/components/singles/CheckBoxGroup';
import Input from '@/components/singles/Input';
import LinkCustom from '@/components/singles/LinkCustom';
import LogoImage from '@/components/singles/LogoImage';
import PasswordInput from '@/components/singles/PasswordInput';
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
          <Input
            type="name"
            placeholder="Nome"
            ref={states.nameRef}
            autoComplete="name"
            disabled={states.isLoading}
            required
          />
          <Input
            type="email"
            placeholder="Email"
            ref={states.emailRef}
            autoComplete="off"
            disabled={states.isLoading}
            required
          />

          {/* inputs com opção de revelar a senha */}
          <PasswordInput
            placeholder="Password"
            autoComplete="new-password"
            inputRef={states.passwordRef}
            isLoading={states.isLoading}
          />
          <PasswordInput
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

          <Button
            type="submit"
            disabled={states.isLoading}
            label={states.isLoading ? 'Loading...' : 'Cadastrar'}
          />
        </form>

        {/* Link to login page com disabled */}
        <LinkCustom
          href="/auth/login"
          label='Já tem uma conta? Faça login'
          disabled={states.isLoading}
        />

      </section>
      {states.errorMessage && <div className="text-red-500">{states.errorMessage}</div>}
      {states.message && <div className="text-green-500">{states.message}</div>}
    </div>
  );
}

export default SignUp