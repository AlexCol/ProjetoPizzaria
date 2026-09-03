# Navegação com Expo Router

Este projeto utiliza **Expo SDK 57** e **Expo Router 57**. O Expo Router cria as rotas a partir dos arquivos localizados em `src/app` e permite combinar diferentes tipos de navegação por meio dos arquivos `_layout.tsx`.

## Tipos principais de navegação

### Stack

A Stack coloca uma nova tela sobre a anterior. É apropriada para autenticação, detalhes, formulários e fluxos em que o usuário precisa avançar e voltar entre telas.

```tsx
import { Stack } from "expo-router";

export default function Layout() {
  return <Stack />;
}
```

As rotas são encontradas automaticamente pelos arquivos da pasta. `Stack.Screen` é necessário apenas quando queremos configurar uma rota:

```tsx
<Stack>
  <Stack.Screen
    name="details"
    options={{ title: "Detalhes" }}
  />
</Stack>
```

### Tabs

Tabs exibem uma barra de abas, normalmente na parte inferior da tela.

```tsx
import { Tabs } from "expo-router";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: "Início" }} />
      <Tabs.Screen name="orders" options={{ title: "Pedidos" }} />
      <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
```

O Expo Router possui diferentes implementações de abas:

- `Tabs`: bottom tabs em JavaScript, com ampla possibilidade de personalização.
- `NativeTabs`: usa a barra de abas nativa do Android e iOS. No SDK 57, ainda é importada de `expo-router/unstable-native-tabs`.
- `expo-router/ui`: fornece componentes sem estilo para criar uma barra de abas personalizada.

Exemplo de tabs nativas:

```tsx
import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Pedidos</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

### Drawer

Drawer cria um menu lateral que pode ser aberto por gesto ou por um botão.

```tsx
import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: "Início" }} />
      <Drawer.Screen name="orders" options={{ title: "Pedidos" }} />
    </Drawer>
  );
}
```

### Slot

`Slot` renderiza a rota filha atual sem criar uma Stack, Tabs ou Drawer. É útil para adicionar elementos compartilhados ao redor de várias páginas.

```tsx
import { Slot } from "expo-router";

export default function Layout() {
  return (
    <>
      <Header />
      <Slot />
      <Footer />
    </>
  );
}
```

### Modal e form sheet

Modal não é um navegador separado. É uma forma de apresentar uma rota dentro de uma Stack.

```tsx
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="create-order"
        options={{ presentation: "modal" }}
      />
      <Stack.Screen
        name="order-details"
        options={{ presentation: "formSheet" }}
      />
    </Stack>
  );
}
```

Outras apresentações disponíveis incluem `transparentModal`, `fullScreenModal` e `containedModal`.

### Navegadores personalizados

O Expo Router também permite criar ou integrar outros navegadores, como top tabs e layouts específicos da aplicação. No SDK 57, a API mais nova para navegadores personalizados ainda é considerada experimental.

Também existe `SplitView`, uma API alpha voltada principalmente para layouts de múltiplas colunas no iPad e iOS. Ela não deve ser a escolha padrão para este projeto.

## Navegadores aninhados

O aplicativo não precisa usar apenas um tipo de navegação. Cada diretório pode ter seu próprio `_layout.tsx` e, consequentemente, seu próprio navegador.

Uma estrutura adequada para o projeto da pizzaria seria:

```text
src/app/
├── _layout.tsx
├── (not-authenticated)/
│   ├── _layout.tsx
│   └── login.tsx
└── (authenticated)/
    ├── _layout.tsx
    ├── dashboard.tsx
    ├── profile.tsx
    └── orders/
        ├── _layout.tsx
        ├── index.tsx
        └── [id].tsx
```

Nesse exemplo:

- O `_layout.tsx` raiz usa uma Stack para controlar autenticação.
- O grupo `(authenticated)` pode usar Tabs ou Drawer.
- A pasta `orders` pode usar outra Stack para navegar da lista até os detalhes de um pedido.
- Os nomes entre parênteses são grupos de rotas e não aparecem na URL.

## Proteção das rotas por autenticação

No layout raiz, as rotas podem ser liberadas ou bloqueadas de acordo com o token armazenado no contexto de autenticação:

```tsx
import { Stack } from "expo-router";
import { useAuthValue } from "@/contexts/auth/AuthContext";

export default function RootNavigator() {
  const { token } = useAuthValue();
  const isAuthenticated = Boolean(token);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(authenticated)" />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(not-authenticated)" />
      </Stack.Protected>
    </Stack>
  );
}
```

Quando o valor de `token` muda, o componente renderiza novamente. O Expo Router bloqueia o grupo anterior e direciona o usuário para uma rota disponível no outro grupo.

## Organização importante

A pasta `src/app` deve conter somente rotas e arquivos especiais do Expo Router. Contextos, componentes, serviços e componentes auxiliares de navegação devem ficar fora dela:

```text
src/
├── app/          # Somente páginas e layouts de rota
├── components/   # Componentes visuais reutilizáveis
├── contexts/     # Contextos React
├── navigation/   # Componentes auxiliares e esta documentação
└── services/     # Comunicação com APIs e outros serviços
```

## Referências

- [Expo Router no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/)
- [Stack no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/stack/)
- [Native Tabs no SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/router/native-tabs/)
- [Layouts de navegação](https://docs.expo.dev/router/basics/navigation-layouts/)
- [Modais](https://docs.expo.dev/router/advanced/modals/)
- [Rotas protegidas](https://docs.expo.dev/router/advanced/protected/)
