'use client'
import Button from "@/components/singles/Button"
import Input from "@/components/singles/Input"
import LinkCustom from "@/components/singles/LinkCustom"
import { FormEvent } from "react"
import categoriaStyles from "./categoria.styles"

export default function Categoria() {
  async function handleRegisterCategory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    alert('oi');
  }

  return (
    <main className={categoriaStyles.container}>
      <h1 className={categoriaStyles.title}>Nova Categoria</h1>
      <form className={categoriaStyles.form} onSubmit={handleRegisterCategory}>
        <Input
          type="text"
          name="name"
          placeholder="Nome da Categoria, ex: Pizzas"
          required
        />
        <Button label="Cadastrar" type="submit" />
      </form>

      <LinkCustom href={'/'} label="Voltar" disabled={false} />
    </main>
  )
}