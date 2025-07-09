export function combina() {
  const array1 = [1, 2, 3];
  const array2 = [4, 5, 6];
  const array3 = [7, 8, 9];

  const combinado = [...array1, ...array3, ...array2];
  console.log(combinado);

  const obj1 = { a: 1, b: 2 };
  const obj2 = { b: 3, c: 4 };
  const obj3 = { d: 5 };
  const combinadoObj = { ...obj1, ...obj2, ...obj3 };
  console.log(combinadoObj);
}