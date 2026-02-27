# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

**Synkra AIOS Dashboard** — A financial/business management system built with Vite, React, TypeScript, and Tailwind CSS. The application provides role-based access control, multi-factor authentication, and real-time financial metrics tracking.

**Technology Stack:**
- Frontend: Vite + React 18 + TypeScript
- UI Components: shadcn-ui (built on Radix UI)
- Styling: Tailwind CSS
- Backend/Database: Supabase (Auth, PostgreSQL, Storage)
- Data Management: TanStack React Query
- Forms: React Hook Form
- Routing: React Router v6
- Charts: Recharts
- Animations: Framer Motion

---

## Quick Start

### Installation
```bash
npm install
```

### Environment Setup
1. Copy `.env.example` to `.env` and fill in required variables:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase public API key
   - Other optional keys for integrations (LLM providers, search tools, etc.)

2. Ensure Supabase project is configured with required tables and policies (see Database Schema below)

### Development
```bash
npm run dev        # Start Vite dev server at http://localhost:8080
npm run build      # Build for production
npm run preview    # Preview production build locally
npm test           # Run tests in watch mode
npm run test       # Run tests once
npm run lint       # Check TypeScript and ESLint
```

### Common Development Tasks
```bash
npm run lint                    # Check code style (ESLint + TypeScript)
npm run dev                     # Start dev server with auto-reload
npm test -- src/file.test.ts   # Run single test file
npm test -- --coverage          # Run tests with coverage report
```

---

## Critical Rules (NEVER / ALWAYS)

### NEVER
- Implement without showing options first (always 1, 2, 3 format)
- Delete/remove content without asking first
- Delete anything created in the last 7 days without explicit approval
- Change something that was already working
- Pretend work is done when it isn't
- Process batch without validating one first
- Add features that weren't requested
- Use mock data when real data exists in database
- Explain/justify when receiving criticism (just fix)
- Trust AI/subagent output without verification
- Create from scratch when similar exists in squads/

### ALWAYS
- Present options as "1. X, 2. Y, 3. Z" format
- Use AskUserQuestion tool for clarifications
- Check squads/ and existing components before creating new
- Read COMPLETE schema before proposing database changes
- Investigate root cause when error persists
- Commit before moving to next task
- Create handoff in `docs/sessions/YYYY-MM/` at end of session

---

## Project Architecture

### Directory Structure
```
src/
├── pages/              # Full-page components (routed pages)
├── components/         # Reusable components
│   ├── ui/            # shadcn-ui primitives (button, card, dialog, etc.)
│   ├── layout/        # Layout components (Sidebar, DashboardLayout)
│   ├── dashboard/     # Dashboard-specific components (charts, cards)
│   ├── forms/         # Form dialog components (CSV upload, settings)
│   ├── ads/           # Advertising-related components
│   └── mfa/           # Multi-factor authentication components
├── contexts/          # React Context (AuthContext for global auth state)
├── hooks/             # Custom React hooks for data management
├── integrations/      # External service integrations (Supabase)
│   └── supabase/      # Supabase client and TypeScript types (auto-generated)
├── lib/               # Utility functions and helpers
├── data/              # Mock data and constants
├── assets/            # Images and static files
├── App.tsx            # Main app component with router and providers
└── main.tsx           # React entry point
```

### Core Patterns

#### Authentication & Authorization
- **AuthContext** (`src/contexts/AuthContext.tsx`) provides global auth state
- Roles: `admin`, `manager`, `viewer` (determined from Supabase profiles table)
- **ProtectedRoute** (`src/components/ProtectedRoute.tsx`) wraps routes requiring authentication
- Role-based access: `requiresAdmin` prop on ProtectedRoute enforces admin-only routes
- **MFA Support**: TOTP-based MFA with `AuthenticatorAssuranceLevels` (AAL1 → AAL2)

```typescript
// Usage in routes
<Route path="/admin-route" element={<ProtectedRoute requireAdmin><AdminPage /></ProtectedRoute>} />
<Route path="/public-route" element={<ProtectedRoute><PublicPage /></ProtectedRoute>} />
```

#### Data Management with React Query
- Use `useQuery` for read operations, `useMutation` for writes
- Custom hooks in `src/hooks/` provide domain-specific data fetching (e.g., `usePlatforms`, `useAdCampaigns`)
- Configure QueryClient in App.tsx with appropriate stale time and cache settings

```typescript
// Example hook pattern (see src/hooks/usePlatforms.ts)
export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase.from('platforms').select('*');
      if (error) throw error;
      return data;
    }
  });
};
```

#### Forms
- Use React Hook Form + Zod for validation
- Form dialogs in `src/components/forms/` (e.g., `PlatformFormDialog.tsx`)
- `react-hook-form`'s `useForm` hook + shadcn-ui `Form` component for rendering

#### Components & Styling
- All UI components imported from `src/components/ui/` (shadcn-ui)
- Custom component composition in domain folders (forms, dashboard, ads, etc.)
- Tailwind CSS for styling with HSL color variables (defined in `tailwind.config.ts`)
- Custom animations: fade-in, slide-in, pulse-glow (see `tailwind.config.ts`)

---

## Database & Supabase Integration

### Supabase Client
- Located at `src/integrations/supabase/client.ts`
- **Auto-generated TypeScript types** in `src/integrations/supabase/types.ts` (do NOT edit directly)
- Session persistence via localStorage with auto-refresh enabled

### Core Tables
The application expects these Supabase tables (with common columns):
- `profiles` - User profiles with roles
- `platforms` - Ad platforms (Facebook, Google, etc.)
- `ad_campaigns` - Advertising campaigns
- `tools` - Development tools and utilities
- `variable_expenses` - Flexible expense tracking
- `withdrawals` - Withdrawal records
- `taxes` - Tax information
- `collaborators` - Team members
- `audit_logs` - Activity logging for admin features

### Common Patterns
```typescript
// Read example
const { data, error } = await supabase
  .from('platforms')
  .select('*')
  .eq('user_id', userId);

// Insert/Update example (with RLS safety)
const { data, error } = await supabase
  .from('platforms')
  .insert({ name: 'Facebook', user_id: userId })
  .select();
```

---

## Key Dependencies & Usage

### shadcn-ui Components
All UI primitives available in `src/components/ui/`. Common ones:
- **Button, Input, Label** - Form basics
- **Dialog, AlertDialog** - Modals
- **Select, Checkbox, RadioGroup** - Form controls
- **Card, Tabs, Accordion** - Containers
- **Toast, Sonner** - Notifications (Sonner preferred for new code)

### React Router
- Routes defined in `App.tsx`
- Protected routes use `ProtectedRoute` wrapper
- Admin routes: add `requireAdmin` prop to `ProtectedRoute`
- Page components in `src/pages/`

### React Query
- Initialize QueryClient in App.tsx
- Wrap app with `QueryClientProvider`
- Use custom hooks for data management (see `src/hooks/`)

### Tailwind CSS
- Dark mode supported via `class` strategy (`darkMode: ["class"]`)
- Theme colors use HSL variables (--primary, --secondary, etc.)
- Custom animations available: fade-in, slide-in, pulse-glow

---

## Code Standards

### TypeScript
- Enable strict mode features as needed; current tsconfig has relaxed settings
- Use type aliases for reusable types (interfaces for object contracts)
- Import types with `type` keyword where appropriate
- Avoid `any` types; use `unknown` if needed

### Component Structure
```typescript
// Functional component pattern
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export default function MyComponent({ title, onAction }: MyComponentProps) {
  // Component logic
  return <div>{title}</div>;
}
```

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile`, `PlatformCard`)
- Hooks: camelCase with `use` prefix (e.g., `usePlatforms`)
- Utils/constants: camelCase (e.g., `formatCurrency`)
- Database columns: snake_case (e.g., `created_at`, `user_id`)

### Imports
- Absolute imports using `@/` alias (preferred)
- Organize: React → libraries → local components → types
- Use path alias `@/*` (configured in tsconfig.json)

```typescript
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { Platform } from '@/integrations/supabase/types';
```

---

## Testing

### Setup
- Test framework: Vitest
- DOM testing: @testing-library/react
- Run: `npm test` (watch mode) or `npm run test` (single run)

### Patterns
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Coverage
- Run `npm test -- --coverage` for coverage reports
- Aim for high coverage on business logic and integrations

---

## Linting & Type Checking

### ESLint Configuration
- Config: `eslint.config.js` (flat config format)
- Rules: TypeScript + React Hooks recommended
- Run: `npm run lint`
- React Refresh rule: warns on non-component exports (allowConstantExport: true)

### TypeScript Checking
- Config: `tsconfig.json` with extended configs for app and build
- Relaxed settings: no implicit any, unused vars/params ignored
- Import path alias: `@/*` → `src/*`

---

## Environment Variables

### Required for Development
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

### Optional (for integrations)
```
VITE_DEEPSEEK_API_KEY=         # For AI agent commands
VITE_OPENROUTER_API_KEY=       # For multi-model routing
VITE_EXA_API_KEY=              # For web search
VITE_GITHUB_TOKEN=             # For GitHub operations
```

### Important Notes
- Prefix with `VITE_` to expose to frontend (Vite convention)
- Never commit `.env` files with real credentials
- Use `.env.example` for template

---

## Performance Optimization

### React Query Caching
- Configure stale time and cache time in QueryClient setup
- Use `gcTime` (formerly `cacheTime`) for aggressive caching
- Implement optimistic updates for user interactions

### Component Rendering
- Use React.memo for heavy components that receive stable props
- Avoid inline functions in props; use useCallback for event handlers
- Track component performance with browser DevTools

### Bundle Size
- Check imports from large libraries (e.g., don't import entire Recharts)
- Tree-shake unused dependencies
- Use dynamic imports for large dialogs/pages if needed

---

## Common Workflows

### Adding a New Page
1. Create component in `src/pages/PageName.tsx`
2. Add route in `App.tsx`
3. Wrap with `ProtectedRoute` if authentication needed
4. Add role check (`requireAdmin`) if admin-only

### Adding a New Form Dialog
1. Create component in `src/components/forms/FormNameDialog.tsx`
2. Use React Hook Form + Zod for validation
3. Import shadcn-ui Form components
4. Call useMutation to persist data via Supabase
5. Handle errors and show toast notifications

### Adding a New Hook
1. Create in `src/hooks/useHookName.ts`
2. Use React Query's `useQuery` or `useMutation`
3. Handle Supabase client calls within hook
4. Return query/mutation object for component consumption

### Connecting a New Table to UI
1. Auto-generate types: `npm run supabase-gen` (if script exists) or manually from Supabase
2. Create hook in `src/hooks/useTableName.ts`
3. Create page or component using the hook
4. Add route to `App.tsx`

---

## Synkra AIOS Development Rules for Claude Code

You are working with Synkra AIOS, an AI-Orchestrated System for Full Stack Development.

<!-- AIOS-MANAGED-START: core-framework -->
## Core Framework Understanding

Synkra AIOS is a meta-framework that orchestrates AI agents to handle complex development workflows. Always recognize and work within this architecture.
<!-- AIOS-MANAGED-END: core-framework -->

<!-- AIOS-MANAGED-START: constitution -->
## Constitution

O AIOS possui uma **Constitution formal** com princípios inegociáveis e gates automáticos.

**Documento completo:** `.aios-core/constitution.md`

**Princípios fundamentais:**

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |

**Gates automáticos bloqueiam violações.** Consulte a Constitution para detalhes completos.
<!-- AIOS-MANAGED-END: constitution -->

<!-- AIOS-MANAGED-START: sistema-de-agentes -->
## Sistema de Agentes

### Ativação de Agentes
Use `@agent-name` ou `/AIOS:agents:agent-name`:

| Agente | Persona | Escopo Principal |
|--------|---------|------------------|
| `@dev` | Dex | Implementação de código |
| `@qa` | Quinn | Testes e qualidade |
| `@architect` | Aria | Arquitetura e design técnico |
| `@pm` | Morgan | Product Management |
| `@po` | Pax | Product Owner, stories/epics |
| `@sm` | River | Scrum Master |
| `@analyst` | Alex | Pesquisa e análise |
| `@data-engineer` | Dara | Database design |
| `@ux-design-expert` | Uma | UX/UI design |
| `@devops` | Gage | CI/CD, git push (EXCLUSIVO) |

### Comandos de Agentes
Use prefixo `*` para comandos:
- `*help` - Mostrar comandos disponíveis
- `*create-story` - Criar story de desenvolvimento
- `*task {name}` - Executar task específica
- `*exit` - Sair do modo agente
<!-- AIOS-MANAGED-END: sistema-de-agentes -->

<!-- AIOS-MANAGED-START: agent-system -->
## Agent System

### Agent Activation
- Agents are activated with @agent-name syntax: @dev, @qa, @architect, @pm, @po, @sm, @analyst
- The master agent is activated with @aios-master
- Agent commands use the * prefix: *help, *create-story, *task, *exit

### Agent Context
When an agent is active:
- Follow that agent's specific persona and expertise
- Use the agent's designated workflow patterns
- Maintain the agent's perspective throughout the interaction
<!-- AIOS-MANAGED-END: agent-system -->

## Development Methodology

### Story-Driven Development
1. **Work from stories** - All development starts with a story in `docs/stories/`
2. **Update progress** - Mark checkboxes as tasks complete: [ ] → [x]
3. **Track changes** - Maintain the File List section in the story
4. **Follow criteria** - Implement exactly what the acceptance criteria specify

### Code Standards
- Write clean, self-documenting code
- Follow existing patterns in the codebase
- Include comprehensive error handling
- Add unit tests for all new functionality
- Use TypeScript/JavaScript best practices

### Testing Requirements
- Run all tests before marking tasks complete
- Ensure linting passes: `npm run lint`
- Verify type checking: `npm run typecheck` (if available)
- Add tests for new features
- Test edge cases and error scenarios

<!-- AIOS-MANAGED-START: framework-structure -->
## AIOS Framework Structure

```
aios-core/
├── agents/         # Agent persona definitions (YAML/Markdown)
├── tasks/          # Executable task workflows
├── workflows/      # Multi-step workflow definitions
├── templates/      # Document and code templates
├── checklists/     # Validation and review checklists
└── rules/          # Framework rules and patterns

docs/
├── stories/        # Development stories (numbered)
├── prd/            # Product requirement documents
├── architecture/   # System architecture documentation
└── guides/         # User and developer guides
```
<!-- AIOS-MANAGED-END: framework-structure -->

<!-- AIOS-MANAGED-START: framework-boundary -->
## Framework vs Project Boundary

O AIOS usa um modelo de 4 camadas (L1-L4) para separar artefatos do framework e do projeto. Deny rules em `.claude/settings.json` reforçam isso deterministicamente.

| Camada | Mutabilidade | Paths | Notas |
|--------|-------------|-------|-------|
| **L1** Framework Core | NEVER modify | `.aios-core/core/`, `.aios-core/constitution.md`, `bin/aios.js`, `bin/aios-init.js` | Protegido por deny rules |
| **L2** Framework Templates | NEVER modify | `.aios-core/development/tasks/`, `.aios-core/development/templates/`, `.aios-core/development/checklists/`, `.aios-core/development/workflows/`, `.aios-core/infrastructure/` | Extend-only |
| **L3** Project Config | Mutable (exceptions) | `.aios-core/data/`, `agents/*/MEMORY.md`, `core-config.yaml` | Allow rules permitem |
| **L4** Project Runtime | ALWAYS modify | `docs/stories/`, `packages/`, `squads/`, `tests/` | Trabalho do projeto |

**Toggle:** `core-config.yaml` → `boundary.frameworkProtection: true/false` controla se deny rules são ativas (default: true para projetos, false para contribuidores do framework).

> **Referência formal:** `.claude/settings.json` (deny/allow rules), `.claude/rules/agent-authority.md`
<!-- AIOS-MANAGED-END: framework-boundary -->

<!-- AIOS-MANAGED-START: rules-system -->
## Rules System

O AIOS carrega regras contextuais de `.claude/rules/` automaticamente. Regras com frontmatter `paths:` só carregam quando arquivos correspondentes são editados.

| Rule File | Description |
|-----------|-------------|
| `agent-authority.md` | Agent delegation matrix and exclusive operations |
| `agent-handoff.md` | Agent switch compaction protocol for context optimization |
| `agent-memory-imports.md` | Agent memory lifecycle and CLAUDE.md ownership |
| `coderabbit-integration.md` | Automated code review integration rules |
| `ids-principles.md` | Incremental Development System principles |
| `mcp-usage.md` | MCP server usage rules and tool selection priority |
| `story-lifecycle.md` | Story status transitions and quality gates |
| `workflow-execution.md` | 4 primary workflows (SDC, QA Loop, Spec Pipeline, Brownfield) |

> **Diretório:** `.claude/rules/` — rules são carregadas automaticamente pelo Claude Code quando relevantes.
<!-- AIOS-MANAGED-END: rules-system -->

<!-- AIOS-MANAGED-START: code-intelligence -->
## Code Intelligence

O AIOS possui um sistema de code intelligence opcional que enriquece operações com dados de análise de código.

| Status | Descrição | Comportamento |
|--------|-----------|---------------|
| **Configured** | Provider ativo e funcional | Enrichment completo disponível |
| **Fallback** | Provider indisponível | Sistema opera normalmente sem enrichment — graceful degradation |
| **Disabled** | Nenhum provider configurado | Funcionalidade de code-intel ignorada silenciosamente |

**Graceful Fallback:** Code intelligence é sempre opcional. `isCodeIntelAvailable()` verifica disponibilidade antes de qualquer operação. Se indisponível, o sistema retorna o resultado base sem modificação — nunca falha.

**Diagnóstico:** `aios doctor` inclui check de code-intel provider status.

> **Referência:** `.aios-core/core/code-intel/` — provider interface, enricher, client
<!-- AIOS-MANAGED-END: code-intelligence -->

<!-- AIOS-MANAGED-START: graph-dashboard -->
## Graph Dashboard

O CLI `aios graph` visualiza dependências, estatísticas de entidades e status de providers.

### Comandos

```bash
aios graph --deps                        # Dependency tree (ASCII)
aios graph --deps --format=json          # Output como JSON
aios graph --deps --format=html          # Interactive HTML (abre browser)
aios graph --deps --format=mermaid       # Mermaid diagram
aios graph --deps --format=dot           # DOT format (Graphviz)
aios graph --deps --watch                # Live mode com auto-refresh
aios graph --deps --watch --interval=10  # Refresh a cada 10 segundos
aios graph --stats                       # Entity stats e cache metrics
```

**Formatos de saída:** ascii (default), json, dot, mermaid, html

> **Referência:** `.aios-core/core/graph-dashboard/` — CLI, renderers, data sources
<!-- AIOS-MANAGED-END: graph-dashboard -->

## Workflow Execution

### Task Execution Pattern
1. Read the complete task/workflow definition
2. Understand all elicitation points
3. Execute steps sequentially
4. Handle errors gracefully
5. Provide clear feedback

### Interactive Workflows
- Workflows with `elicit: true` require user input
- Present options clearly
- Validate user responses
- Provide helpful defaults

## Best Practices

### When implementing features:
- Check existing patterns first
- Reuse components and utilities
- Follow naming conventions
- Keep functions focused and testable
- Document complex logic

### When working with agents:
- Respect agent boundaries
- Use appropriate agent for each task
- Follow agent communication patterns
- Maintain agent context

### When handling errors:
```javascript
try {
  // Operation
} catch (error) {
  console.error(`Error in ${operation}:`, error);
  // Provide helpful error message
  throw new Error(`Failed to ${operation}: ${error.message}`);
}
```

## Git & GitHub Integration

### Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `docs:`, `chore:`, etc.
- Reference story ID: `feat: implement IDE detection [Story 2.1]`
- Keep commits atomic and focused

### GitHub CLI Usage
- Ensure authenticated: `gh auth status`
- Use for PR creation: `gh pr create`
- Check org access: `gh api user/memberships`

<!-- AIOS-MANAGED-START: aios-patterns -->
## AIOS-Specific Patterns

### Working with Templates
```javascript
const template = await loadTemplate('template-name');
const rendered = await renderTemplate(template, context);
```

### Agent Command Handling
```javascript
if (command.startsWith('*')) {
  const agentCommand = command.substring(1);
  await executeAgentCommand(agentCommand, args);
}
```

### Story Updates
```javascript
// Update story progress
const story = await loadStory(storyId);
story.updateTask(taskId, { status: 'completed' });
await story.save();
```
<!-- AIOS-MANAGED-END: aios-patterns -->

## Environment Setup

### Required Tools
- Node.js 18+
- GitHub CLI
- Git
- npm (included with Node.js)

### Configuration Files
- `.env` - Environment variables (copy from `.env.example`)
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Tailwind CSS theme
- `tsconfig.json` - TypeScript configuration

<!-- AIOS-MANAGED-START: common-commands -->
## Common Commands

### AIOS Master Commands
- `*help` - Show available commands
- `*create-story` - Create new story
- `*task {name}` - Execute specific task
- `*workflow {name}` - Run workflow

### Development Commands
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Check code style with ESLint
- `npm test` - Run tests in watch mode
- `npm run test` - Run tests once
<!-- AIOS-MANAGED-END: common-commands -->

## Debugging

### Enable Debug Mode
```bash
export AIOS_DEBUG=true
```

### Browser DevTools
- Inspect React component tree (install React DevTools extension)
- Check Network tab for Supabase requests
- Use Console for debugging JavaScript errors

### Supabase Logs
- Visit your Supabase project dashboard
- Check Auth logs for authentication errors
- Check Database logs for RLS policy violations

### React Query Devtools
```typescript
// Can be added for development
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// Add to App.tsx: <ReactQueryDevtools initialIsOpen={false} />
```

## Claude Code Specific Configuration

### Performance Optimization
- Prefer batched tool calls when possible for better performance
- Use parallel execution for independent operations
- Cache frequently accessed data in memory during sessions

### Tool Usage Guidelines
- Always use the Grep tool for searching, never `grep` or `rg` in bash
- Use the Task tool for complex multi-step operations
- Batch file reads/writes when processing multiple files
- Prefer editing existing files over creating new ones

### Session Management
- Track story progress throughout the session
- Update checkboxes immediately after completing tasks
- Maintain context of the current story being worked on
- Save important state before long-running operations

### Error Recovery
- Always provide recovery suggestions for failures
- Include error context in messages to user
- Suggest rollback procedures when appropriate
- Document any manual fixes required

### Testing Strategy
- Run tests incrementally during development
- Always verify lint before marking complete
- Test edge cases for each new feature
- Document test scenarios in story files

### Documentation
- Update relevant docs when changing functionality
- Include code examples in documentation
- Keep README synchronized with actual behavior
- Document breaking changes prominently

---

*Synkra AIOS Claude Code Configuration + Project-Specific Guidance v2.1*
