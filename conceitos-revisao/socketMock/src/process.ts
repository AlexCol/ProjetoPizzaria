// Tratamento global de erros não capturados
process.on('uncaughtException', (error: Error): void => {
  console.error('❌ Erro não capturado:', error.message);
  console.error('Stack:', error.stack);
  // Não sair da aplicação, apenas logar o erro
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>): void => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
});