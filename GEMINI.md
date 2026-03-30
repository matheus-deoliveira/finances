# Projeto: Finances - Gerenciador Financeiro Minimalista

## 1. Objetivo do Projeto
Criar uma aplicação de gestão financeira pessoal focada na simplicidade e na redução de atrito no registro de despesas. O sistema deve ser robusto, modular e altamente testável, servindo como modelo de excelência técnica.

## 2. Requisitos Funcionais (Core)

### 2.1. Gestão de Transações
Registro de entradas (receitas) e saídas (gastos):
* Descrição, Valor, Data e Categoria.
* Categorias: Dízimo, Contas, Dívidas, Investimentos, Estudos, Metas Pessoais.

### 2.2. Inteligência Financeira (Core Logic)
1.  **À vista:** Débito integral no mês de competência.
2.  **Recorrente:** Replicação automática mensal até cancelamento.
3.  **Parcelado:** Cálculo de diluição automática entre os meses (Ex: R$ 1200 em 12x gera R$ 100/mês).

## 3. Diretrizes de Engenharia e Qualidade

### 3.1. Princípios de Design
*   **Responsividade & Mobile-First:** O design deve ser concebido primeiramente para dispositivos móveis e escalar de forma fluida para telas maiores. O uso de layouts adaptativos e tipografia fluida é obrigatório.
*   **SOLID:** Responsabilidade única, aberto/fechado, substituição de Liskov, segregação de interface e inversão de dependência.

* **DRY (Don't Repeat Yourself):** Abstração de lógicas comuns em serviços ou utilitários.
* **KISS (Keep It Simple, Stupid):** Soluções elegantes sem complexidade acidental.
* **Clean Code:** Nomes significativos, funções pequenas e código autoexplicativo.

### 3.2. Estratégia de Testes (Mandatória)
Nenhuma funcionalidade é considerada completa sem testes:
* **Testes Unitários:** Cobertura de lógica de negócio (cálculos de parcelas, regras de recorrência).
* **Testes de Integração:** Validação de contratos de API e persistência.
* **TDD (Test-Driven Development):** Encorajado para lógicas complexas de domínio.

### 3.3. Qualidade de Código
* **TypeScript (Frontend):** Tipagem estrita, sem uso de `any`.
* **Static Analysis:** Uso de ESLint, Prettier e ferramentas de linting para Java/Spring.
* **CI/CD:** Pipelines automatizados para execução de testes e linting em cada commit.

## 4. Arquitetura Modular

### 4.1. Backend (Spring Boot 3.x - Java 17+)
Arquitetura em camadas com foco em Domínio:
* **API/Web:** Controllers REST, DTOs e validação de entrada (Bean Validation).
* **Domain/Service:** Lógica de negócio pura, isolada de frameworks.
* **Infrastructure/Persistence:** Repositories JPA e entidades de banco de dados.
* **Database:** **H2 Database** (Persistência em arquivo local para agilidade no desenvolvimento e portabilidade).
* **Mappers:** Conversão explícita entre Entidades e DTOs (ex: MapStruct ou manual).

### 4.2. Frontend (React + TypeScript + Vite)
Arquitetura baseada em **Feature-Sliced Design (FSD)**:
*   **App:** Provedores globais (Theme, QueryClient, Auth), rotas e estilos globais.
*   **Pages:** Orquestradores de rota que compõem features e entities.
*   **Features:** Ações do usuário com lógica de negócio (ex: `AddTransactionForm`, `FilterTransactions`).
*   **Entities:** Lógica de domínio e estado (ex: `TransactionCard`, `useTransactionsStore`).
*   **Shared:** 
    *   **UI (Atomic):** Componentes puros e reutilizáveis (Button, Input, Card, Modal, Badge, Skeleton).
    *   **API:** Clientes base para requisições (Axios/Fetch configurados).
    *   **Utils:** Validadores (Zod), formatadores de moeda e data.

### 4.3. Gerenciamento de Estado e Dados
*   **Server State:** `TanStack Query (React Query)` para cache e sincronização com a API.
*   **Global/Local State:** `Zustand` para estados globais leves ou `React Context` para estados de composição de componentes.
*   **Forms:** `React Hook Form` + `Zod` para validação de esquemas e tipagem forte.

### 4.4. Estratégia de Testes Frontend
*   **Unitários (Vitest + RTL):** Testar lógica de hooks, utilitários e componentes Shared.
*   **Componentes (Playwright Component Testing):** Validação de interações complexas em features.
*   **Acessibilidade:** Testes automáticos com `axe-core`.

## 5. Estrutura de Dados (Modelo de Domínio)
*   **Transaction:** 
    *   `id`: UUID
    *   `description`: String
    *   `amount`: number (tratado internamente em centavos para evitar erros de float)
    *   `date`: ISO Date String
    *   `type`: 'INCOME' | 'EXPENSE'
    *   `paymentType`: 'SPOT' | 'RECURRING' | 'INSTALLMENT'
    *   `category`: Category (ID ou Slug)
    *   `metadata`: { currentInstallment?: number, totalInstallments?: number }

## 6. Orquestração Gemini CLI

### 6.1. Workflow de Desenvolvimento
1. **Definição de Contrato:** Criar DTOs e Interfaces antes da implementação.
2. **Implementação do Domínio:** Focar na lógica e nos testes unitários.
3. **Implementação da UI:** Componentização baseada em Atomic Design ou FSD.
4. **Integração e Validação:** Testes de ponta a ponta ou integração manual.

### 6.2. Uso de Skills
*   **Frontend-Design:** Para componentes visuais memoráveis e funcionais.
*   **Generalist:** Para refatorações em massa ou ajustes de configuração.

## 7. Sistema Visual & Frontend-Design Skill

Para garantir que a interface não seja "genérica", a IA deve aplicar as seguintes diretrizes da skill `frontend-design`:

### 7.1. Estética "Fintech Premium" & Layout
*   **Responsividade & Layout:**
    *   **Mobile-First:** Priorizar a facilidade de uso com uma mão (áreas de toque >= 44px).
    *   **Breakpoints:** Utilizar padrões consistentes (sm: 640px, md: 768px, lg: 1024px, xl: 1280px).
    *   **Containers:** Uso de larguras máximas controladas para evitar estiramento excessivo em monitores ultra-wide.
*   **Tipografia:** Uso de fontes geométricas modernas (ex: *Outfit*, *Satoshi* ou *General Sans*). Contraste acentuado entre títulos (ExtraBold) e corpo (Regular/Medium). Tipografia fluida com `clamp()` para ajuste dinâmico entre tamanhos de tela.
*   **Cores:** 
    *   Fundo: Neutros profundos (#0F0F0F) ou Off-white puro (#FAFAFA).
    *   Ações: Cores vibrantes em pequenos detalhes (ex: Verde Esmeralda para receitas, Laranja Coral para despesas).
    *   Superfícies: Glassmorphism sutil ou sombras "soft" (0 4px 20px rgba(0,0,0,0.05)).
*   **Micro-interações:**
    *   Feedback tátil visual em botões (escala 0.98 no clique).
    *   Transições suaves de layout com `Framer Motion` (staggered animations).

## 8. Inicialização do Projeto (Scaffolding)

Para garantir que o projeto siga as melhores práticas e estruturas recomendadas pelas comunidades oficiais, a inicialização deve ser feita via terminal:

### 8.1. Frontend (Vite + React + TS)
O scaffold deve ser gerado utilizando o Vite, que oferece a estrutura mais moderna e performática:
```bash
# Exemplo de comando (dentro da pasta /frontend ou raiz conforme estratégia)
npm create vite@latest . -- --template react-ts
```
*   **Mandatório:** Configurar imediatamente o ESLint, Prettier e o `tsconfig.json` conforme as regras de tipagem estrita da seção 3.3.

### 8.2. Backend (Spring Boot 3.x)
O scaffold deve ser gerado preferencialmente via **Spring Initializr** (via API curl ou CLI), garantindo as dependências corretas:
```bash
# Exemplo via curl (start.spring.io)
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,validation,h2,lombok \
  -d javaVersion=17 \
  -d type=maven-project \
  -d bootVersion=3.2.0 \
  -d groupId=com.finances \
  -d artifactId=api \
  -o backend.zip
```
*   **Mandatório:** Seguir a estrutura de pastas detalhada na seção 4.1 imediatamente após o unzip.

### 8.3. Padronização de Commits
*   Uso de **Conventional Commits** (`feat:`, `fix:`, `chore:`, `test:`, `refactor:`) para manter um histórico de mudanças legível e profissional.

## 9. Automação e Execução Local

Para facilitar o uso diário da aplicação em ambiente Windows, deve-se criar um fluxo de inicialização com um único clique.

### 9.1. Script de Inicialização (`run_finances.bat`)
Um arquivo `.bat` na raiz do projeto deve orquestrar o boot simultâneo do Backend e do Frontend:
```batch
@echo off
title Finances - Local Server
echo Inicializando Gerenciador Financeiro...

:: Iniciar Backend em segundo plano
start /b cmd /c "cd backend && ./mvnw spring-boot:run"

:: Iniciar Frontend
start /b cmd /c "cd frontend && npm run dev"

echo Aplicacao rodando!
echo Backend: http://localhost:8080
echo Frontend: http://localhost:5173
pause
```

### 9.2. Atalho na Área de Trabalho
1.  Criar um atalho para o arquivo `run_finances.bat`.
2.  Alterar o ícone do atalho para um ícone personalizado de finanças.
3.  Configurar para "Executar Minimizado" se preferir uma experiência mais limpa.
