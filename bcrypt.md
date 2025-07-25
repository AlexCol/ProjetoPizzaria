# Bcrypt: Resumo e Boas Práticas

## 📋 Índice
- [Salt Único vs String Própria](#salt-único-vs-string-própria)
- [Como funciona o bcrypt.compare()](#como-funciona-o-bcryptcompare)
- [Formas de usar o bcrypt](#formas-de-usar-o-bcrypt)
- [Minor Versions](#minor-versions)
- [Conclusões e Recomendações](#conclusões-e-recomendações)

---

## 🧂 Salt Único vs String Própria

### ✅ **Vantagens do `bcrypt.genSalt()`**

- **Salt único para cada senha** - mesmo senha gera hash diferente
- **Proteção contra rainbow tables** e ataques pré-computados
- **Salt incluído automaticamente** no hash gerado
- **Padrão de segurança** recomendado pela comunidade

### ❌ **Problemas do salt fixo**

- Vulnerável a rainbow tables
- Senhas iguais resultam em hashes iguais
- Menor entropia e segurança comprometida
- Violação de boas práticas de segurança

---

## 🔍 Como funciona o `bcrypt.compare()`

### Processo interno:

1. **Extrai o salt** do hash armazenado
2. **Aplica o mesmo salt** à senha fornecida pelo usuário
3. **Compara os hashes** resultantes
4. Retorna `true` se coincidirem

### Anatomia do hash bcrypt:

```
$2b$10$N9qo8uLOickgx2ZMRZoMyeW0J3C9i3P5pWyd1EWRMKsj5hDdIQH9Wy
│ │ │ │                    └─── Hash (31 chars)
│ │ │ └────── Salt (22 chars)
│ │ └──────── Cost (rounds): 10
│ └────────── Minor version: b
└──────────── Algorithm: 2
```

---

## 🛠️ Formas de usar o bcrypt

### Método 1 - Direto (Recomendado)
```typescript
// Simples e eficiente
return bcrypt.hash(password, 12); // 12 rounds
```

### Método 2 - Com genSalt (Explícito)
```typescript
// Mais controle sobre o salt
const salt = await bcrypt.genSalt(12, "b");
return bcrypt.hash(password, salt);
```

---

## 🔢 Minor Versions

| Versão | Descrição | Status |
|--------|-----------|--------|
| `$2a$` | Versão original | Amplamente suportada |
| `$2b$` | **Atual padrão** | ✅ Recomendado |
| `$2x$`, `$2y$` | Correções específicas | Uso específico |

---

## 📚 Conclusões e Recomendações

### ✅ **Boas Práticas**

- ✔️ Sempre usar `bcrypt.genSalt()` ou passar rounds diretamente
- ✔️ **12+ rounds** recomendado para aplicações modernas (2024+)
- ✔️ Deixar o bcrypt escolher a minor version automaticamente (`$2b$`)
- ✔️ Nunca usar salt fixo em produção

### 🚫 **Evitar**

- ❌ Salt fixo ou string própria
- ❌ Menos de 10 rounds (inseguro para 2024+)
- ❌ Armazenar salt separadamente

### 🔧 **Implementação Final Recomendada**

```typescript
export class BcryptService implements IHashingService {
  async hashPassword(password: string): Promise<string> {
    // Opção 1: Simples e seguro
    return bcrypt.hash(password, 12);
    
    // Opção 2: Explícito
    // const salt = await bcrypt.genSalt(12);
    // return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
```

### 🔐 **Resumo de Segurança**

> **Salt único** = proteção contra rainbow tables  
> **Mais rounds** = mais segurança (mas também mais lentidão)  
> **bcrypt** automaticamente gerencia salt + hash = facilidade de uso

---

## 🎯 **TL;DR**

Use bcrypt com **salt único** e **12+ rounds** para máxima segurança! 🛡️

```typescript
// ✅ Recomendado
return bcrypt.hash(password, 12);

// ❌ Evitar
return bcrypt.hash(password, "salt_fixo");
```