function soma(...numeros: number[]): number {
  return numeros.reduce((total, atual) => total + atual, 0);
}

export default function spread() {
  console.log("-----------------------Spread");
  const numeros = [1, 2, 3, 4, 5];
  let resultado = soma(...numeros); //posso mandar um array, com spread

  console.log(...numeros);
  console.log(`A soma dos números é: ${resultado}`);

  console.log(6, 7, 8, 9, 10);
  resultado = soma(6, 7, 8, 9, 10); //posso mandar vários números separados
  console.log(`A soma dos números é: ${resultado}`);

}