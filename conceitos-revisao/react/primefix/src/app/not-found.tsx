import Link from "next/link";

export default function NotFound() {
  return ( //pagina de layout não se aplica ao arquivo de NotFound
    <div className={styles.notFound}>
      <h1 className={styles.title}>404</h1>
      <h2 className={styles.subtitle}>Página não encontrada!</h2>
      <Link href="/" className={styles.link}> Voltar para a página inicial</Link>
    </div>
  );
}

//deixado aqui os estilos para a página de NotFound
const notFoundTailwindClass = `
  h-full  
  flex 
  flex-col 
  items-center 
  justify-center
`;

const titleTailwindClass = `
  text-6xl font-bold mb-4
`;
const subtitleTailwindClass = `
  text-2xl mb-8
`;

const linkTailwindClass = `
  text-blue-500 hover:text-blue-700
  transition-colors duration-300
  underline
`;

const styles = {
  notFound: notFoundTailwindClass,
  title: titleTailwindClass,
  subtitle: subtitleTailwindClass,
  link: linkTailwindClass
}