export default function GradientBackground() {
  return (
    <div className='fixed inset-0 overflow-hidden'>
      {/* camada de contraste (usa cores do tema) */}
      <div
        className='
        absolute 
        inset-0 
        bg-background'
      />

      {/* camada gradiente principal */}
      <div
        className='
        absolute 
        inset-0 
        animate-gradient 
        bg-linear-to-br from-primary via-secondary to-tertiary'
      />

      {/* camada radial suave */}
      <div
        className='
        absolute 
        inset-0 
        bg-[radial-gradient(circle_at_50%_120%,rgba(59,130,246,0.25),rgba(15,23,42,0.05))]'
      />
    </div>
  );
}
