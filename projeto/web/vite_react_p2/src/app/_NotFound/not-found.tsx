'use client';

import { useTheme } from 'next-themes';
import { Link } from 'react-router-dom';
import FuzzyText, { type FuzzyTextProps } from '@/components/singles/_reactbits/FuzzyText';

export default function NotFound() {
  const { theme } = useTheme();
  const props: FuzzyTextProps = {
    color: theme === 'dark' ? '#fff' : '#000',
    baseIntensity: 0.2,
    hoverIntensity: 0.5,
    enableHover: true,
    fontWeight: 'bold',
    children: undefined,
  };
  return (
    //pagina de layout não se aplica ao arquivo de NotFound
    <div className={styles.notFound}>
      <FuzzyText {...props}>404</FuzzyText>

      <div className='py-4'></div>

      <FuzzyText {...props} fontSize={40}>
        Página não encontrada!
      </FuzzyText>

      <div className='py-4'></div>

      <Link to='/' className={styles.link}>
        Voltar para home
      </Link>
    </div>
  );
}

//deixado aqui os estilos para a página de NotFound
const notFoundTailwindClass = `
  h-full  
  m-auto
  flex 
  flex-col 
  items-center 
  justify-center
`;

const linkTailwindClass = `
  text-primary
  transition-colors duration-300
`;

const styles = {
  notFound: notFoundTailwindClass,
  link: linkTailwindClass,
};
