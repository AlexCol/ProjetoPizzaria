# Testar o app no celular Android

Este guia mostra como compilar, instalar e executar o app diretamente em um Redmi Note 11 usando um cabo USB.

## 1. Preparar o computador

Para compilar o aplicativo localmente, instale:

- Android Studio
- JDK 17
- Android SDK Platform 36
- Android SDK Build-Tools
- Android SDK Platform-Tools (`adb`)

No Windows, o Android SDK costuma ficar em:

```text
%LOCALAPPDATA%\Android\Sdk
```

Adicione este diretório ao `Path` do usuário:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

Depois de alterar o `Path`, feche e abra novamente o PowerShell e confirme que o `adb` está disponível:

```powershell
adb --version
```

## 2. Ativar a depuração USB no Redmi Note 11

1. Abra **Configurações > Sobre o telefone**.
2. Toque sete vezes em **Versão do MIUI** até ativar o modo desenvolvedor.
3. Volte para **Configurações > Configurações adicionais > Opções do desenvolvedor**.
4. Ative **Depuração USB**.
5. Ative **Instalar via USB**, se essa opção estiver disponível.

## 3. Conectar o celular

1. Conecte o Redmi ao computador usando um cabo USB de dados.
2. No celular, selecione **Transferência de arquivos** como modo da conexão USB.
3. Mantenha o celular desbloqueado.
4. Quando aparecer **Permitir depuração USB?**, marque a opção para sempre permitir neste computador e confirme.

No PowerShell, verifique a conexão:

```powershell
adb devices
```

O aparelho deve aparecer com o estado `device`:

```text
List of devices attached
1234567890    device
```

## 4. Compilar e instalar o aplicativo

Abra o PowerShell na pasta do projeto mobile:

```powershell
cd D:\meusRepos\ProjetoPizzaria\projeto\mobile\reactnative_p2
```

Compile e instale o app no aparelho conectado:

```powershell
npx.cmd expo run:android --device
```

Se uma lista de dispositivos aparecer, selecione o Redmi Note 11. Ao terminar, o Expo instalará e abrirá o aplicativo automaticamente.

Mantenha o terminal aberto durante o desenvolvimento, pois ele executa o servidor Metro utilizado pelo app.

## 5. Próximas execuções

Enquanto não houver alterações em dependências ou configurações nativas, não é necessário recompilar toda vez. Com o aplicativo já instalado, execute:

```powershell
npx.cmd expo start --dev-client
```

Depois, abra o aplicativo instalado no celular. Se ele não se conectar automaticamente, confirme que celular e computador estão na mesma rede Wi-Fi.

Quando houver mudanças em `app.json`, plugins do Expo ou dependências nativas, execute novamente:

```powershell
npx.cmd expo run:android --device
```

## Solução de problemas

### O aparelho aparece como `unauthorized`

Desbloqueie o celular e aceite a solicitação de depuração USB. Se a solicitação não aparecer:

1. Abra as opções do desenvolvedor no celular.
2. Selecione **Revogar autorizações de depuração USB**.
3. Desconecte e conecte o cabo novamente.
4. Aceite a nova solicitação.

### Nenhum aparelho aparece em `adb devices`

- Confirme que o cabo permite transferência de dados.
- Selecione **Transferência de arquivos** no celular.
- Teste outra porta USB.
- Verifique no Gerenciador de Dispositivos do Windows se é necessário instalar o driver USB da Xiaomi ou o Google USB Driver.
- Reinicie o ADB:

```powershell
adb kill-server
adb start-server
adb devices
```

### `adb` não é reconhecido

Confirme que o Android SDK Platform-Tools está instalado e que este diretório está no `Path`:

```text
%LOCALAPPDATA%\Android\Sdk\platform-tools
```

Também é possível executar o ADB pelo caminho completo:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

### O computador não consegue acessar o servidor Metro

Com o celular conectado por USB, encaminhe a porta do Metro:

```powershell
adb reverse tcp:8081 tcp:8081
```

Depois reinicie o servidor:

```powershell
npx.cmd expo start --dev-client --clear
```

### A barra inferior do Android continua branca

Confirme que está abrindo o aplicativo compilado e instalado pelo `expo run:android`, e não o Expo Go. As configurações nativas da barra de navegação não são aplicadas pelo Expo Go.

Se a configuração da barra foi alterada depois da última instalação, recompile e reinstale:

```powershell
npx.cmd expo run:android --device
```
