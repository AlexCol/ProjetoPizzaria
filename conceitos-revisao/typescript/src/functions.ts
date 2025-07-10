export function functions() {
  console.log("-----------------------Funções");

  // Exemplo de função simples
  function saudacao(nome: string): string {
    return `Olá, ${nome}!`;
  }
  console.log(saudacao("Mundo"));

  // Função com parâmetros padrão
  function soma(a: number, b: number = 0): number {
    return a + b;
  }
  console.log(soma(5));
  console.log(soma(5, 10));

  // Função anônima
  const multiplicar = function (a: number, b: number): number {
    return a * b;
  };
  console.log(multiplicar(2, 3));

  // Função de seta (arrow function)
  const dividir = (a: number, b: number): number => a / b;
  console.log(dividir(10, 2));
}