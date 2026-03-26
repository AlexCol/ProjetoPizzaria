
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={footerTailwindClass}>
      <span className='text-sm'>{`© ${currentYear} Translator Server.`}</span>
    </footer>
  );
}

export default Footer;

const footerTailwindClass = `
  h-14
  flex
  items-center
  justify-center
  bg-background
  border-t
  border-border
  mt-auto
  transition-colors duration-300
`;
