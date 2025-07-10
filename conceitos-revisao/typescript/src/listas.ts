
function map() {
  console.log("map => Mapa percorre um array e transforma seus valores, retornando um array de mesmo tamanho com os valores transformados.");
  const numeros = [1, 2, 3, 4, 5];
  const quadrados = numeros.map((n) => n * n);
  console.log(quadrados);
}

function reduce() {
  console.log("reduce => Reduz um array a um único valor, aplicando uma função acumuladora a cada elemento.");
  const numeros = [1, 2, 3, 4, 5];
  const soma = numeros.reduce((acumulador, atual, indice, arrayOriginal) => acumulador + atual, 0); // O segundo parâmetro é o valor inicial do acumulador
  console.log(soma);
}

function filter() {
  console.log("filter => Filtra os elementos de um array com base em uma condição, retornando um novo array com os elementos que atendem à condição.");
  const numeros = [1, 2, 3, 4, 5];
  const pares = numeros.filter((n) => n % 2 === 0);
  console.log(pares);
}

function forEach() {
  console.log("forEach => Executa uma função para cada elemento de um array, sem retornar um novo array.");
  const numeros = [1, 2, 3, 4, 5];
  numeros.forEach((n) => console.log(n));
}

function find() {
  console.log("find => Retorna o primeiro elemento de um array que satisfaz uma condição.");
  const numeros = [1, 6, 3, 4, 5];
  const par = numeros.find((n) => n % 2 === 0);
  console.log(par);
}

function findIndex() {
  console.log("findIndex => Retorna o índice do primeiro elemento de um array que satisfaz uma condição.");
  const numeros = [1, 6, 3, 4, 5];
  const indice = numeros.findIndex((n) => n % 2 === 0);
  console.log(indice);
}

function flat() {
  console.log("flat => Achata um array de arrays em um único array.");
  const numeros = [1, 2, [3, 4], 5];
  const achatado = numeros.flat();
  console.log(achatado);
}

function splice() {
  console.log("splice => Altera o conteúdo de um array removendo ou substituindo elementos existentes e/ou adicionando novos elementos.");
  const numeros = [1, 2, 3, 4, 5];
  const removidos = numeros.splice(1, 2, 6, 7); // Remove 2 elementos a partir do índice 1 e adiciona 6 e 7
  console.log(removidos);
  console.log(numeros);
}

function includes() {
  console.log("includes => Verifica se um array contém um determinado elemento, retornando true ou false.");
  const nomes = ["Alexandre", "Maria", "João", "Ana"];
  const contemJoao = nomes.includes("João"); // Verifica se o array contém "João"
  console.log(contemJoao);
}

export function listas() {
  console.log("-----------------------Listas");
  map();
  reduce();
  filter();
  forEach();
  find();
  findIndex();
  flat();
  splice();
  includes();
}