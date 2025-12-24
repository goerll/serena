# Serena Manager

Frontend administrativo do sistema Serena, desenvolvido com Next.js 15, React 19, TypeScript e Tailwind CSS.

## Estrutura do Projeto

O projeto segue a estrutura do Next.js App Router:

- `app/` - Diretório principal com rotas e componentes
  - `circle/` - Gerenciamento de círculos
  - `question/` - Gerenciamento de questões
  - `question-circle/` - Associação de questões a círculos
  - `import-students/` - Importação de estudantes
  - `components/` - Componentes reutilizáveis
- `lib/` - Utilitários e configurações
  - `api.ts` - Cliente HTTP centralizado (Axios)
  - `utils.ts` - Funções utilitárias

## Configuração

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
cp .env.example .env.local
```

Edite `.env.local` e defina a URL da API:

```
NEXT_PUBLIC_API_URL=http://localhost:4999
```

Por padrão, o sistema usa `http://localhost:4999` se a variável não estiver definida.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Build para Produção

```bash
npm run build
npm start
```

## Arquitetura

- **API Client**: Configuração centralizada em `lib/api.ts` usando Axios
- **TypeScript**: Tipagem completa em todos os componentes
- **Tailwind CSS**: Estilização utilitária
- **App Router**: Rotas baseadas em arquivos no diretório `app/`

## Funcionalidades

- Gerenciamento de círculos de avaliação
- Criação e edição de questões (abertas, múltipla escolha, completar)
- Associação de questões a círculos
- Importação de estudantes via CSV
- Correção de respostas dos estudantes
