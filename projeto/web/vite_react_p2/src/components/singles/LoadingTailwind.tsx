export default function LoadingTailwind() {
  return (
    <div className={containerTailwindClass}>
      <div className={wrapperTailwindClass}>
        <span className={`${ballBaseTailwindClass} ${ballColor1TC}`} style={{ animationDelay: '0s' }} />
        <span className={`${ballBaseTailwindClass} ${ballColor2TC}`} style={{ animationDelay: '0.2s' }} />
        <span className={`${ballBaseTailwindClass} ${ballColor1TC}`} style={{ animationDelay: '0.4s' }} />
        <span className={`${ballBaseTailwindClass} ${ballColor2TC}`} style={{ animationDelay: '0.6s' }} />
      </div>
    </div>
  );
}

const containerTailwindClass = `
  flex
  items-center
  justify-center
  h-full
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

const ballColor1TC = `bg-primary`; // Cor da primeira bolinha
const ballColor2TC = `bg-secondary`; // Cor da segunda bolinha
