# SECURITY.md - Documentação de Segurança

## Visão Geral

Este sistema implementa um modelo de acesso **whitelist-only** (apenas usuários previamente autorizados podem acessar). Não existe cadastro aberto - todos os usuários devem ser adicionados manualmente por um administrador.

## Arquitetura de Segurança

### 1. Autenticação e Autorização

- **Whitelist obrigatória**: Apenas e-mails cadastrados na tabela `allowed_users` podem acessar
- **Verificação dupla**: Checagem antes E depois da autenticação (defense in depth)
- **Rate limiting**: 5 tentativas falhas em 10 minutos = bloqueio temporário de 10 minutos
- **Auditoria completa**: Todas as tentativas de login são registradas

### 2. Papéis (Roles)

| Papel | Descrição | Permissões |
|-------|-----------|------------|
| `admin` | Administrador | Acesso total, gerencia whitelist, vê logs |
| `manager` | Gerente | Cria/edita dados, não pode excluir ou gerenciar usuários |
| `viewer` | Visualizador | Somente leitura |

### 3. Políticas RLS (Row Level Security)

Todas as tabelas possuem RLS ativado:
- **SELECT**: Apenas usuários na whitelist ativa
- **INSERT/UPDATE**: Apenas `admin` e `manager`
- **DELETE**: Apenas `admin`

## Como Adicionar um Usuário

1. Faça login como **administrador**
2. Acesse **Usuários Permitidos** no menu lateral
3. Preencha o e-mail e selecione o perfil desejado
4. Clique em **Adicionar**

O usuário agora pode fazer login com o e-mail cadastrado (precisa criar uma conta com esse e-mail).

## Como Promover para Admin

1. Acesse **Usuários Permitidos**
2. Localize o usuário na lista
3. Altere o perfil para **Administrador** no dropdown

## Como Revogar Acesso

### Desativar temporariamente:
1. Acesse **Usuários Permitidos**
2. Desative o switch de status do usuário
3. O usuário será deslogado automaticamente na próxima navegação

### Remover permanentemente:
1. Acesse **Usuários Permitidos**
2. Clique no ícone de lixeira
3. Confirme a exclusão

## Onde Ver Logs

1. Faça login como **administrador**
2. Acesse **Logs de Acesso** no menu lateral
3. Visualize:
   - Logins bem-sucedidos
   - Tentativas bloqueadas (não autorizado, rate limit, etc.)
   - Filtros por e-mail e status

## Funções de Segurança no Banco

| Função | Descrição |
|--------|-----------|
| `is_allowed_user(email)` | Verifica se e-mail está na whitelist ativa |
| `is_admin(email)` | Verifica se e-mail é administrador |
| `get_user_role(email)` | Retorna o papel do usuário |
| `is_rate_limited(email)` | Verifica se está bloqueado por rate limit |
| `log_login_attempt(...)` | Registra tentativa de login |

## Boas Práticas

1. **Não compartilhe credenciais** de administrador
2. **Revise periodicamente** a lista de usuários permitidos
3. **Monitore os logs** para identificar tentativas suspeitas
4. **Desative** usuários que não precisam mais de acesso (ao invés de remover)
5. **Use o papel mínimo necessário** (princípio do menor privilégio)

## Resposta a Incidentes

Se identificar atividade suspeita:

1. **Desative imediatamente** o usuário comprometido
2. **Revise os logs** para entender a extensão
3. **Altere senhas** se necessário
4. **Notifique** os administradores

## Limitações Conhecidas

- Rate limit é por e-mail (não por IP)
- Logs são mantidos indefinidamente (considere limpeza periódica)
- Não há autenticação multi-fator (MFA) implementada
