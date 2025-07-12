import { useState } from "react";

function Button() {
  //esse controle precisa ficar num contexto global
  //e possívelmente salvo no cadastro do usuário para manter em acessos futuros
  const [isDarkMode, setIsDarkMode] = useState(false);
  const buttonText = `Activate: ${isDarkMode ? 'Light Mode ☀️ ' : 'Dark Mode 🌙'}`;

  function toggleDarkMode() {
    if (isDarkMode) {
      document.body.classList.remove('dark'); //ou documentElement ser no Html
      document.body.classList.add('light'); //ou documentElement ser no Html
    } else {
      document.body.classList.remove('light'); //ou documentElement ser no Html
      document.body.classList.add('dark'); //ou documentElement ser no Html
    }
    setIsDarkMode(!isDarkMode);
  }

  return (
    <button
      id='dark-mode'
      className={buttonTailwindClass}
      onClick={toggleDarkMode}
    >{buttonText}</button>
  );
}

export default Button;

const buttonTailwindClass = `
  bg-blue-500
  hover:bg-blue-900
  text-white
  dark:bg-blue-800
  dark:text-white
  dark:hover:bg-blue-400
  py-2
  px-4
  duration-300
  self-end
`;