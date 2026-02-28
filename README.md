![img alt](https://github.com/isaacmenezes/artemis_pizzaria/blob/48d0869ee74e57f0272aeace0c3c3472f45ea540/pizzaApp/assets/img/readme_header.png)
![Status do Projeto](https://img.shields.io/badge/Status-Conclu%C3%ADdo_/_Em_Refatora%C3%A7%C3%A3o-brightgreen?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)


## Sobre o projeto
O **Ártemis Pizzaria** é uma aplicação mobile (com painel de gestão web) desenvolvida como Trabalho de Conclusão de Curso Técnico. Seu objetivo principal é otimizar o gerenciamento de pedidos personalizados no ambiente interno de restaurantes e pizzarias.

A solução foi projetada sob uma **arquitetura cliente-servidor**, com comunicação via APIs REST, garantindo:
- **Autonomia do cliente** no registro e personalização de pedidos.
- **Redução de falhas humanas** operacionais.
- **Otimização do fluxo interno** do restaurante.

> **Nota Arquitetural:** Embora validado no setor de pizzarias através de um estudo de caso, o modelo arquitetural é **agnóstico e escalável**, podendo ser adaptado para outros cenários de varejo que exijam fluxos complexos de personalização no modelo BYOD (*Bring Your Own Device*).

---

## Minha Contribuição (Full Stack & UI/UX)
Atuei de ponta a ponta na concepção e desenvolvimento do projeto:
- **UI/UX Design:** Elaboração de wireframes, definição de fluxos de navegação e prototipação de alta fidelidade no Figma.
- **Frontend Mobile & Web:** Implementação da interface do aplicativo (React Native) e do painel administrativo (Web).
- **Backend:** Construção da API REST (Node.js + Express) e modelagem de dados relacional utilizando Prisma ORM.
- **Integração:** Conexão entre a aplicação e o servidor garantindo a segurança e o tratamento das requisições.

### Melhorias Pós-TCC (Foco em Portfólio)
- Refatoração da configuração do Axios (remoção de `baseURL` *hardcoded*).
- Implementação de variáveis de ambiente (`.env`) para maior segurança na comunicação com o backend.
- Ajustes estruturais e organização de pastas visando melhor manutenibilidade e padrões limpos de código.

---

## Tecnologias Utilizadas

### Frontend (Mobile & Web)
- **React Native & Expo:** Desenvolvimento mobile cross-platform.
- **TypeScript:** Tipagem estática para maior segurança do código.
- **React Navigation:** Gerenciamento do fluxo de telas.
- **Axios:** Cliente HTTP para comunicação com a API.
- **Async Storage:** Persistência local de dados (sessões e tokens).
- **Expo Camera / Barcode Scanner:** Leitura de QR Code para vinculação de mesas.
- **React Native Gesture Handler:** Melhoria na interação tátil da interface.

### Backend & Banco de Dados
- **Node.js & Express:** Roteamento da API REST e lógica de negócios.
- **Prisma ORM:** Modelagem estruturada (MER/DER) e tipagem segura na comunicação com o banco.
- **Supabase (PostgreSQL):** Banco de dados relacional e escalável em nuvem.

### Ferramentas de Apoio
- **Design & UX:** Figma (Wireframes, Guia de Estilos e Protótipo de Alta Fidelidade).
- **Modelagem:** Draw.io (MER/DER).
- **Testes:** Insomnia (testes de rotas da API).
- **Gestão & Versionamento:** Git, GitHub e Trello (Scrum/Kanban).

---

## Funcionalidades
- [x] Cadastro e autenticação segura de usuários.
- [x] Leitura de QR Code para abertura de comanda/vinculação de mesa.
- [x] Catálogo digital com fluxos complexos de personalização de produtos.
- [x] Gerenciamento e acompanhamento do status do pedido em tempo real.
- [x] Validação robusta de regras de negócio na API antes da persistência de dados.
- [x] Criar, editar e excluir produtos e ingredientes, assim como categorias dos mesmos.

---

## Estrutura do Projeto

```text
├── mobile/     # Aplicação React Native (Frontend do Cliente)
├── web/        # Aplicação Web (Painel Administrativo)
├── backend/    # API REST (Node + Express + Prisma)
└── docs/       # Documentação técnica do TCC (Normas ABNT)
```

---

## Arquitetura da Aplicação

A solução foi estruturada seguindo princípios de separação de responsabilidades e arquitetura cliente-servidor.

### Visão Técnica

- **Arquitetura:** Cliente-Servidor
- **Comunicação:** API REST stateless via HTTP
- **Backend:** Node.js + Express
- **ORM:** Prisma (tipagem segura e abstração de queries)
- **Banco de Dados:** PostgreSQL (Supabase)
- **Frontend:** React Native (mobile) e aplicação Web administrativa
- **Persistência Local:** Async Storage (tokens e sessão)
- **Gerenciamento de Estado e Navegação:** React Navigation

### Estrutura em Camadas (Backend)

> Controller → Service → Prisma ORM → PostgreSQL

- **Controller:** Recebe requisições HTTP e valida dados.
- **Service:** Contém regras de negócio.
- **Prisma ORM:** Intermedia comunicação tipada com o banco.
- **Banco:** Persistência relacional estruturada.

Essa organização garante maior manutenibilidade, escalabilidade e clareza arquitetural.

---

## Resultados Técnicos

- Redução de etapas manuais no processo de registro de pedidos.
- Minimização de falhas humanas através de validações centralizadas na API.
- Arquitetura escalável e adaptável a outros contextos de varejo.
- Estrutura preparada para expansão modular de funcionalidades.
- Validação prática da solução por meio de estudo de caso aplicado ao setor de pizzarias.

---

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+ recomendado)
- NPM ou Yarn
- Conta no Supabase configurada
- Expo CLI (para execução mobile)

---

### 1. Configuração do Backend

```bash
cd backend
npm install
```

Crie um arquivo .env na pasta backend com as seguintes variáveis:
```code
DATABASE_URL="sua_string_de_conexao_supabase"
PORT=3333
```

Execute o servidor:
```bash
npm run dev
```

### 2. Configuração do Mobile

```bash
cd pizzaapp
npm install
npx expo start
```

### 3. Aplicação Web (Painel Administrativo)
```bash
cd frontend
npm install
npm run dev
```

---

## Documentação Técnica e Artefatos Visuais

A documentação acadêmica completa do projeto encontra-se na pasta `/docs`, elaborada conforme as normas ABNT.

O documento inclui:

- Fundamentação teórica
- Estudo de caso aplicado
- Modelagem de dados (MER/DER)
- Diagramas de casos de uso
- Diagramas arquiteturais
- Fluxos de navegação
- Wireframes e protótipos de alta fidelidade
- Capturas de tela da aplicação mobile e do painel web
- Exemplos de código e validações da API

As imagens, diagramas e representações visuais detalhadas do sistema estão integralmente documentadas nesse material, servindo como complemento técnico e conceitual ao código-fonte disponibilizado neste repositório.
