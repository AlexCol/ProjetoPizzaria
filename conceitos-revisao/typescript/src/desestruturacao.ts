
export function desestruturacao() {
  console.log("-----------------------Desestruturação");

  // Desestruturação de objetos
  const pessoa = {
    nome: 'Alexandre',
    idade: 30,
    profissao: 'Desenvolvedor'
  };

  const { nome, idade, profissao } = pessoa;
  console.log(`Nome: ${nome}, Idade: ${idade}, Profissão: ${profissao}`);

  // Desestruturação de arrays
  const numeros = [1, 2, 3, 4, 5];
  const [primeiro, segundo, ...resto] = numeros;
  console.log(`Primeiro: ${primeiro}, Segundo: ${segundo}, Resto: ${resto}`);

  // Desestruturação de arrays2
  const { 0: primeiro2, 1: segundo2, 2: terceiro2 } = numeros;
  console.log(`Primeiro: ${primeiro2}, Segundo: ${segundo2}, Terceiro: ${terceiro2}`);
}
