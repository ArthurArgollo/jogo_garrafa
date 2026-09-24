# Bottle Fill 🎮

Bottle Fill é um jogo casual feito com React e Vite. O objetivo é segurar a garrafa para enchê-la e soltar no momento certo, atingindo a meta sem transbordar.

## Funcionalidades

- Garrafas aleatórias com formatos e estilos diferentes.
- Tipos de garrafa: refrigerante, suco, bebida energética, água, detergente, desinfetante e shampoo.
- Rótulos, cores, tampas e líquidos personalizados para cada tipo.
- Quatro dificuldades: lento, médio, rápido e insano.
- Meta e velocidade aumentam conforme o nível.
- Recorde salvo automaticamente no navegador.
- Interface responsiva para computador e celular.

## Como executar

Requisitos: Node.js e npm instalados.

```bash
npm install
npm run dev
```

Depois, abra o endereço exibido pelo Vite no terminal.

## Comandos disponíveis

```bash
npm run dev       # inicia o servidor de desenvolvimento
npm run build     # gera a versão de produção
npm run preview   # visualiza a versão de produção
npm run lint      # verifica problemas no código
```

## Como jogar

1. Escolha uma dificuldade.
2. Pressione ou toque na garrafa para começar a enchê-la.
3. Solte quando o líquido estiver dentro da meta indicada.
4. Se passar de 100%, a garrafa transborda e você perde a rodada.
5. Ao vencer, avance para a próxima garrafa e tente bater seu recorde.

## Tecnologias

- React 19
- Vite
- CSS moderno com clip-path, filtros SVG e animações
- LocalStorage para persistência do recorde

## Verificação

O projeto deve passar nestes comandos antes de ser publicado:

```bash
npm run lint
npm run build
```
