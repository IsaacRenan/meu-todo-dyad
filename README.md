# Meu To Do — Isaac Renan

App de lista de tarefas com autenticação Supabase, soft delete com confirmação e restauração de tarefas.

## Funcionalidades

- ✅ Criar conta / Login com Supabase Auth
- ✅ Criar tarefas vinculadas ao usuário
- ✅ Visualizar tarefas ativas
- ✅ **Soft Delete** com modal de confirmação
- ✅ **Restaurar tarefa** da lixeira com modal de confirmação
- ✅ Aba "Lixeira" para ver tarefas excluídas
- ✅ Contadores de tarefas ativas e na lixeira
- ✅ Layout visual único (dark, Space Grotesk + Space Mono)

## Stack

- React + Vite
- Supabase (Auth + Database)
- Deploy: Vercel

## Setup local

```bash
npm install
cp .env.example .env
# Preencha .env com suas credenciais do Supabase
npm run dev
```

## SQL Supabase

Execute no SQL Editor do seu projeto Supabase:

```sql
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own todos" ON todos
  FOR UPDATE USING (auth.uid() = user_id);
```
