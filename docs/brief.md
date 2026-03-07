# Project Brief: Marketing Operating System (MOS)

> **Gerado por:** Atlas (Analyst Agent)
> **Data:** 2026-03-06
> **Status:** Draft — Aprovação pendente → @pm

---

## Executive Summary

O **Marketing Operating System (MOS)** é um painel de comando central para operadores de Direct Response que precisam gerir múltiplos produtos, funis e campanhas simultaneamente com visibilidade total e velocidade de decisão. O sistema elimina o caos operacional causado por dados fragmentados em planilhas, ferramentas desconexas e falta de inventário centralizado de ativos digitais.

**Será construído como extensão do acesapp existente** (Vite + React + Supabase), aproveitando infraestrutura já funcional para entregar valor utilizável em 3 dias.

---

## Problem Statement

### Estado atual
Operações de Direct Response com 1–10 produtos simultâneos operam com dados distribuídos entre:
- Planilhas para cash flow
- Business Managers do Facebook para campanhas
- Notion/Airtable para ativos e criativos
- Memória ou documentos avulsos para senhas e acessos

### Impacto do problema
- **Decisões lentas:** operador passa 30–60 min/dia consolidando dados antes de decidir o que escalar ou pausar
- **Perda de ativos:** domínios expiram, pixels quebram, contas são perdidas por falta de inventário
- **Inteligência desperdiçada:** testes A/B e resultados de criativos não são documentados sistematicamente, conhecimento se perde
- **Risco operacional:** sem alerta de site fora do ar ou checkout quebrado, a operação sangra sem saber

### Por que soluções existentes não resolvem

| Ferramenta | Problema |
|---|---|
| Hyros / Triple Whale | Só attribution — não gerencia ativos nem cash flow |
| Notion / Airtable | Planilha disfarçada — sem cálculos automáticos, sem estrutura |
| Metabase / Retool | Genérico — precisa de semanas para configurar |
| Excel | Não é multi-device, não tem histórico, não escala |

**Nenhuma ferramenta no mercado combina:** asset management + campaign control + creative intelligence + cash flow P&L em interface única para DR operators.

---

## Proposed Solution

Um **Mission Control** para operadores de Direct Response construído como módulo do acesapp, com entrada de dados manual no início e arquitetura preparada para integração de APIs futuras.

### Princípios do design
1. **Manual first, API later** — funciona imediatamente sem integrações
2. **Decisão em 30 segundos** — dashboard principal mostra estado completo da operação
3. **Inventário como fundação** — tudo parte de saber o que existe e seu status
4. **Acumulação de inteligência** — cada teste registrado vira vantagem competitiva

### Diferencial vs. stack atual
O acesapp já tem 30–40% da infraestrutura necessária (`platforms`, `ad_campaigns`, `variable_expenses`, `withdrawals`, `audit_logs`). O MOS estende o que existe, não recria.

---

## Target Users

### Usuário Primário: CEO/CMO de operação de Direct Response

**Perfil:**
- Opera 1–10 produtos simultâneos em mercados como US, BR, ES
- Fatura entre 6–9 dígitos anuais
- Trabalha com media buyers, criativos e time financeiro
- Toma decisões diárias de alocação de capital em campanhas

**Comportamento atual:**
- Consolida dados manualmente todo manhã antes de decidir o dia
- Não tem inventário centralizado de ativos digitais
- Perde inteligência de testes por falta de documentação sistemática

**Objetivo:** Ver o estado completo da operação em < 60 segundos e decidir o que escalar, pausar ou testar.

---

## Goals & Success Metrics

### Objetivos de negócio
- Reduzir tempo de consolidação diária de dados de 30–60 min para < 5 min
- Eliminar perda de ativos digitais (domínios expirados, pixels quebrados)
- Criar registro permanente de inteligência de criativos e testes
- Viabilizar decisões de alocação de capital baseadas em dado, não em feeling

### Métricas de sucesso do usuário
- Operador abre o sistema 1x por dia e tem tudo que precisa para decidir o dia
- Zero ativos perdidos por falta de inventário
- Histórico de P&L diário disponível para qualquer produto em qualquer período
- Creative Registry com pelo menos 1 winner documentado por produto após 30 dias

### KPIs
- **Time-to-decision:** tempo entre abrir o app e tomar decisão de campanha (alvo: < 5 min)
- **Asset coverage:** % de ativos da operação catalogados no sistema (alvo: 100%)
- **Daily entry rate:** % de dias com cash flow registrado (alvo: > 90%)
- **Creative registry fill rate:** % de testes com resultado documentado (alvo: > 80%)

---

## MVP Scope

### Core Features — Fase 1 (3 dias)

**1. Asset Registry**
Inventário completo de todos os ativos digitais da operação.
- Campos: produto, tipo (domínio/página/pixel/conta ads/gateway/checkout/email), nome, país, status (online/pausado/banido/morto), link/ID, notas, última verificação
- Filtros por produto, tipo, status, país
- CRUD completo com validação

**2. Campaign Control**
Tabela de campanhas com performance diária de entrada manual.
- Campos: produto, conta ads, país, spend diário, revenue diário, ROAS calculado, CPA, status (escalando/testando/pausar/morto)
- Calculado automaticamente: ROAS = revenue/spend, lucro = revenue - spend
- View: ranking de campanhas por ROAS, filtro por status

**3. Cash Flow Diário**
P&L diário por produto e consolidado.
- Entrada: data, produto, spend total, revenue total
- Calculado: profit, margin %
- View: período selecionável (7d, 30d, custom), por produto ou consolidado

### Out of Scope — MVP
- Integração com API Facebook/Google Ads
- Site monitoring automático
- Sistema de alertas automáticos
- Funil tracking (pixel/eventos)
- Password Vault (usar 1Password/Bitwarden separado)
- Multi-usuário / permissões por time

### MVP Success Criteria
O sistema é considerado MVP quando: operador consegue (1) cadastrar todos os ativos da operação, (2) registrar spend+revenue diário por produto, (3) ver P&L consolidado por período em < 3 cliques — tudo sem treinamento.

---

## Post-MVP Vision

### Fase 2 — Semana 1–2

**4. Creative Registry**
Banco de inteligência de testes e criativos.
- Campos: produto, nome do anúncio, hook, VSL, oferta, status (testando/winner/perdedor), resultado (ROAS, CPM, CTR), data início/fim, notas
- View: winners por produto, histórico de testes

**5. Mission Control Dashboard**
Vista única com todos os KPIs agregados.
- Cards: revenue hoje, spend hoje, profit hoje, MER (Media Efficiency Ratio)
- Tabela: top campanhas por ROAS
- Alertas visuais: campanha com ROAS < threshold

### Fase 3 — Quando pronto para integrações

- **API Facebook Ads:** importar spend/impressões automaticamente
- **Webhook checkout:** revenue automático via Hotmart/Stripe webhook
- **Site monitoring:** checar status de domínios cadastrados no Asset Registry
- **Alertas automáticos:** ROAS caiu, site fora do ar, checkout quebrado
- **Multi-usuário:** media buyers com acesso restrito por produto

### Visão de longo prazo (6–12 meses)

Sistema de IA que monitora a operação 24h e gera recomendações: "Escale BM22 — ROAS estável há 3 dias", "Pause Ad14 — CTR caiu 40% vs. média", "Domínio diabetesfix.com vence em 30 dias".

---

## Technical Considerations

### Platform Requirements
- **Target:** Web app (desktop-first, mas responsivo para mobile)
- **Browser:** Chrome/Safari/Edge modernos
- **Performance:** Carregamento inicial < 2s, CRUD < 500ms

### Technology (confirmar stack existente)
- **Frontend:** Vite + React 18 + TypeScript + shadcn-ui (já existe)
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS) (já existe)
- **State:** TanStack React Query (já existe)
- **Forms:** React Hook Form + Zod (já existe)

### Architecture Considerations

**Novas tabelas necessárias:**
```sql
-- Asset Registry (nova)
assets (id, user_id, product, asset_type, name, country, status, link_or_id, notes, last_checked, created_at)

-- Creative Registry (nova — Fase 2)
creatives (id, user_id, product, ad_name, hook, vsl, offer, status, roas_result, notes, started_at, ended_at)

-- Daily Cash Flow (nova — extend variable_expenses ou tabela própria)
daily_cashflow (id, user_id, product, date, spend, revenue, profit, notes)
```

**Tabelas existentes que serão estendidas:**
- `ad_campaigns` → adicionar campos: spend_today, revenue_today, roas, cpa, campaign_status
- `platforms` → já cobre parte do Asset Registry, avaliar merge ou manter separado

**Sem breaking changes:** toda nova funcionalidade é additiva — nenhuma tabela ou componente existente é removido ou alterado.

### Security / Compliance
- RLS (Row Level Security) por user_id em todas as novas tabelas
- Sem dados de terceiros (API keys, senhas) armazenados no banco
- Audit log de operações críticas (delete, status change)

---

## Constraints & Assumptions

### Constraints
- **Timeline:** Fase 1 em 3 dias (Asset Registry + Campaign Control + Cash Flow)
- **Recursos:** Desenvolvimento solo via AIOS agents
- **Budget:** Zero — usa infraestrutura existente (Supabase free tier ou plano atual)
- **Técnico:** Sem APIs externas no MVP — tudo entrada manual

### Key Assumptions
- O usuário vai usar o sistema diariamente para registrar dados (disciplina operacional)
- 1–3 produtos simultâneos no curto prazo (sistema escala para mais sem redesign)
- Supabase existente tem capacidade para as novas tabelas sem upgrade de plano
- Não há necessidade de acesso multi-usuário no curto prazo

---

## Risks & Open Questions

### Key Risks

- **Risco de abandono por atrito de entrada manual:** Se o registro diário for trabalhoso, o usuário abandona. Mitigação: formulários ultra-rápidos, defaults inteligentes, campo de entrada em linha (inline edit).
- **Sobreposição com tabelas existentes:** `platforms` e `ad_campaigns` existentes podem conflitar com novos módulos. Mitigação: @architect avalia merge vs. extensão antes do desenvolvimento.
- **Escopo creep:** Tendência de querer adicionar monitoramento automático, alertas e APIs antes do MVP. Mitigação: manter foco nos 3 módulos manuais primeiro.
- **Perda de dados em migração:** Dados existentes em `platforms` e `ad_campaigns` precisam ser preservados. Mitigação: apenas adições — nenhum dado existente alterado no MVP.

### Open Questions
- Os dados existentes em `platforms` e `ad_campaigns` devem ser migrados para o novo formato ou as tabelas coexistem?
- Qual é o threshold de ROAS aceitável para o alerta visual no Mission Control? (Ex: < 1.5 = vermelho)
- O sistema precisa de múltiplos produtos com moedas diferentes (USD, BRL, EUR)?

### Areas Needing Further Research
- Schema detalhado de `ad_campaigns` existente — verificar o que já existe antes de adicionar campos
- Capacidade atual do Supabase project (tabelas, rows, storage)
- UX pattern ideal para entrada diária de dados (form vs. inline table edit)

---

## Appendices

### A. Research Summary

**Gap de mercado confirmado:** Nenhuma ferramenta existente (Hyros, Triple Whale, Voluum, Funnel.io, Notion, Airtable) cobre o escopo completo de: asset management + campaign control + creative intelligence + cash flow em interface única para DR operators.

**Benchmarks relevantes:**
- Operações de 8–9 dígitos constroem internamente ou integram 3–5 ferramentas
- Custo de stack típico: $1.500–5.000/mês em ferramentas desconexas
- O MOS substitui essa stack com custo marginal zero (usa infraestrutura existente)

**Infraestrutura existente mapeada:**
- `platforms` → cobre Asset Registry parcialmente
- `ad_campaigns` → cobre Campaign Control parcialmente
- `variable_expenses` + `withdrawals` → cobre Cash Flow parcialmente
- `audit_logs` → rastreabilidade já implementada
- Auth + RLS + MFA → segurança enterprise já funcional

### C. References
- Brainstorming session: `docs/sessions/2026-03/` (esta conversa)
- Stack existente: `CLAUDE.md` — Technology Stack section
- Schema atual: `src/integrations/supabase/types.ts`

---

## Next Steps

### Immediate Actions
1. `@architect` — revisar schema existente e definir novas tabelas (assets, daily_cashflow, extensões de ad_campaigns)
2. `@pm` — criar PRD com épicos e stories a partir deste brief
3. `@sm` — criar Story 1: Asset Registry (Fase 1, dia 1–2)
4. `@dev` — implementar Asset Registry após story aprovada por `@po`

### PM Handoff

Este Project Brief fornece o contexto completo para o **Marketing Operating System**. O próximo passo é criar o PRD com épicos estruturados:

- **Épico 1:** Asset Registry (MVP Fase 1)
- **Épico 2:** Campaign Control + Cash Flow (MVP Fase 1)
- **Épico 3:** Creative Registry + Mission Control (Fase 2)
- **Épico 4:** Integrações e automação (Fase 3)

Por favor, inicie no modo 'PRD Generation Mode', revisando este brief para criar o PRD seção por seção, solicitando clarificações necessárias e sugerindo melhorias onde apropriado.
