import type { LucideProps } from 'lucide-react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';

type iconProps = {
  containerClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
  icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  pulse?: boolean;
  badge?: number;
  imageBase64?: string;
};

function Icon(props: iconProps) {
  const mainContainerClass = `${containerTC} ${props.containerClassName}`;
  const subContainerClass = `${iconContainerTC} ${props.iconContainerClassName} ${props.pulse ? 'animate-pulse' : ''}`;
  const iconClass = `${iconTC} ${props.iconClassName}`;
  const imageSrc = props.imageBase64 ? `data:image/png;base64,${props.imageBase64}` : undefined;

  return (
    <div className={mainContainerClass}>
      <div className={subContainerClass}>
        {props.icon ? (
          <props.icon className={iconClass} />
        ) : props.imageBase64 ? (
          <img src={imageSrc} alt='icon' className={iconClass} />
        ) : (
          <div className={iconClass} /> // Placeholder vazio caso nenhum ícone seja fornecido
        )}

        {/* Badge condicional - numerozinho para mostrar quantidade (tipo de mensagens não lidas) */}
        {props.badge !== undefined && <div className={badgeTC}>{props.badge}</div>}
      </div>
    </div>
  );
}

export default Icon;

/*********************************************************/
/* Styles for Icon component                             */
/*********************************************************/
const containerTC = `
  flex 
  justify-center 
`;

const iconContainerTC = `
  relative  
  rounded-full 
  flex 
  items-center 
  justify-center
  bg-linear-to-tl from-secondary to-primary
`;

const iconTC = ``;

const badgeTC = `
  absolute top-0 right-0 
  bg-danger
  text-xs 
  font-bold 
  rounded-full 
  w-5
  h-5
  flex 
  items-center 
  justify-center 
  shadow-lg
`;

// O containerTC (mainContainerClass) usa 'flex justify-center' para centralizar o círculo do ícone
// dentro do espaço disponível do componente pai. Sem ele, o ícone fica alinhado à esquerda.
//
// O iconContainerTC (subContainerClass) também tem 'flex justify-center', mas esse centraliza
// o conteúdo (ícone SVG ou <div>) dentro do próprio círculo.
//
// Ou seja:
// - mainContainerClass centraliza o círculo do ícone no componente.
// - subContainerClass centraliza o ícone dentro do círculo.
// - 'relative' serve apenas para posicionamento absoluto dos filhos (ex: badge), não afeta alinhamento.
//
// Ambos são necessários para garantir que o ícone fique perfeitamente centralizado visualmente.
