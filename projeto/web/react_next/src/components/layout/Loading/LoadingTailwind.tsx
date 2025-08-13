
export default function LoadingTailwind() {
  return (
    <div className={containerTailwindClass}>
      <div className={wrapperTailwindClass}>
        <span className={`${ballBaseTailwindClass} ${ballColor1}`} style={{ animationDelay: '0s' }} />
        <span className={`${ballBaseTailwindClass} ${ballColor2}`} style={{ animationDelay: '0.2s' }} />
        <span className={`${ballBaseTailwindClass} ${ballColor3}`} style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

const containerTailwindClass = `
  flex
  items-center
  justify-center
  h-screen
  bg-gray-200
  dark:bg-gray-800
`; // Centraliza o loader na tela, aplica fundo claro/escuro

const wrapperTailwindClass = `
  flex
  space-x-2
`; // Organiza as bolinhas lado a lado com espaçamento

const ballBaseTailwindClass = `
  block
  w-4
  h-4
  rounded-full
  animate-bounce
`; // Define formato, tamanho e animação das bolinhas

const ballColor1 = `bg-amber-400`; // Cor da primeira bolinha
const ballColor2 = `bg-amber-500`; // Cor da segunda bolinha
const ballColor3 = `bg-amber-600`; // Cor da terceira bolinha