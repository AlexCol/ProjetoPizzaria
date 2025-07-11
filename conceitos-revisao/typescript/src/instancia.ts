class Foo {
  nome = 'alex';

  fala() {
    console.log(this.nome);
  }
}

export default function instancia() {
  console.log("-----------------------Instância");
  const foo = new Foo();
  foo.fala(); // aqui funciona: this === foo
  const ref = foo.fala;
  //ref(); // aqui quebra: this === undefined
}
