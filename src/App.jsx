import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'

/* ══════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════ */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  const icons = { success: '✓', error: '✕', warn: '⚠' }
  return (
    <div className={`toast ${type}`}>
      <span>{icons[type]}</span>
      {message}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MODAL SOFT DELETE
══════════════════════════════════════════════ */
function ConfirmModal({ task, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">🗑️</div>
        <h3>Excluir tarefa?</h3>
        <p>Você tem certeza que deseja excluir esta tarefa?</p>
        <div className="modal-task-name">"{task.title}"</div>
        <p style={{ fontSize: 12, color: 'var(--warn)' }}>
          A tarefa será movida para a lixeira e pode ser restaurada depois.
        </p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Sim, excluir</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MODAL RESTAURAR
══════════════════════════════════════════════ */
function RestoreModal({ task, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">♻️</div>
        <h3 style={{ color: 'var(--warn)' }}>Restaurar tarefa?</h3>
        <p>Deseja devolver esta tarefa para a lista ativa?</p>
        <div className="modal-task-name">"{task.title}"</div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-restore" onClick={onConfirm}>♻ Restaurar</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   MODAL EDITAR
══════════════════════════════════════════════ */
function EditModal({ task, onConfirm, onCancel }) {
  const [title, setTitle] = useState(task.title)
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">✏️</div>
        <h3 style={{ color: 'var(--accent2)' }}>Editar tarefa</h3>
        <p>Altere o texto da tarefa abaixo:</p>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={200}
          autoFocus
          style={{
            width: '100%',
            background: 'var(--surface2)',
            border: '1px solid var(--accent2)',
            borderRadius: '6px',
            padding: '10px 14px',
            color: 'var(--text)',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            outline: 'none',
            margin: '12px 0 20px',
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && title.trim()) onConfirm(title.trim())
            if (e.key === 'Escape') onCancel()
          }}
        />
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button
            className="btn"
            style={{ background: 'var(--accent2)', color: '#0d0f14' }}
            disabled={!title.trim() || title.trim() === task.title}
            onClick={() => onConfirm(title.trim())}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ITEM DE TAREFA
══════════════════════════════════════════════ */
function TaskItem({ task, index, onDelete, onRestore, onEdit }) {
  const isDeleted = !!task.deleted_at
  const date = new Date(task.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit'
  })

  return (
    <div className={`task-item ${isDeleted ? 'deleted' : ''}`}>
      <span className="task-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="task-text">{task.title}</span>
      {isDeleted && <span className="deleted-badge">excluída</span>}
      <span className="task-meta">{date}</span>
      <div className="task-actions">
        {isDeleted ? (
          <button className="btn btn-restore btn-sm" onClick={() => onRestore(task)}>
            ♻ Restaurar
          </button>
        ) : (
          <>
            <button
              className="btn btn-sm"
              style={{ background: 'transparent', color: 'var(--accent2)', border: '1px solid rgba(126,200,227,0.3)', fontSize: '12px' }}
              onClick={() => onEdit(task)}
            >
              ✏ Editar
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(task)}>
              Excluir
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════ */
function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(''); setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.user)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Conta criada! Faça login agora.')
        setMode('login')
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-wrapper">
      <div className="app-header" style={{ maxWidth: 400 }}>
        <div className="app-logo">
          <span className="app-logo-mark">TODO_</span>
          <span className="app-logo-sub">Isaac Renan</span>
        </div>
      </div>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-title">{mode === 'login' ? '→ Entrar' : '+ Criar conta'}</div>
          <div className="auth-subtitle">{mode === 'login' ? 'Acesse sua lista de tarefas' : 'Registre-se para começar'}</div>
          {error && <div className="auth-error">⚠ {error}</div>}
          {success && <div className="auth-success">✓ {success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div className="form-group">
              <label>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>
          </form>
          <div className="auth-toggle">
            {mode === 'login' ? (
              <>Não tem conta?{' '}<button onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Cadastre-se</button></>
            ) : (
              <>Já tem conta?{' '}<button onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Fazer login</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   APP PRINCIPAL
══════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [newTitle, setNewTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [tab, setTab] = useState('ativas')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [confirmRestore, setConfirmRestore] = useState(null)
  const [editTask, setEditTask] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const loadTasks = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error) setTasks(data || [])
  }, [user])

  useEffect(() => { loadTasks() }, [loadTasks])

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  async function addTask(e) {
    e.preventDefault()
    if (!newTitle.trim()) return
    setAdding(true)
    const { error } = await supabase
      .from('todos')
      .insert({ title: newTitle.trim(), user_id: user.id, deleted_at: null })
    if (!error) {
      setNewTitle('')
      await loadTasks()
      showToast('Tarefa criada!')
    } else {
      showToast('Erro ao criar tarefa.', 'error')
    }
    setAdding(false)
  }

  async function confirmDeleteTask() {
    const task = confirmDelete
    setConfirmDelete(null)
    const { error } = await supabase
      .from('todos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', task.id)
    if (!error) {
      await loadTasks()
      showToast('Tarefa movida para a lixeira.', 'warn')
    } else {
      showToast('Erro ao excluir.', 'error')
    }
  }

  async function confirmRestoreTask() {
    const task = confirmRestore
    setConfirmRestore(null)
    const { error } = await supabase
      .from('todos')
      .update({ deleted_at: null })
      .eq('id', task.id)
    if (!error) {
      await loadTasks()
      showToast('Tarefa restaurada! ♻')
    } else {
      showToast('Erro ao restaurar.', 'error')
    }
  }

  async function confirmEditTask(novoTitulo) {
    const task = editTask
    setEditTask(null)
    const { error } = await supabase
      .from('todos')
      .update({ title: novoTitulo })
      .eq('id', task.id)
    if (!error) {
      await loadTasks()
      showToast('Tarefa atualizada! ✏')
    } else {
      showToast('Erro ao editar.', 'error')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setTasks([])
    setTab('ativas')
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
        carregando...
      </div>
    )
  }

  if (!user) return <AuthPage onAuth={setUser} />

  const ativas = tasks.filter(t => !t.deleted_at)
  const lixeira = tasks.filter(t => !!t.deleted_at)
  const displayed = tab === 'ativas' ? ativas : lixeira

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="app-logo">
          <span className="app-logo-mark">TODO_</span>
          <span className="app-logo-sub">Isaac Renan</span>
        </div>
        <div className="user-info">
          <span className="user-email">{user.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={logout}>Sair</button>
        </div>
      </header>

      <main className="main-content">
        <div className="stats-bar">
          <div className="stat-pill"><strong>{ativas.length}</strong> ativas</div>
          <div className="stat-pill deleted"><strong>{lixeira.length}</strong> na lixeira</div>
        </div>

        <form className="new-task-form" onSubmit={addTask}>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Nova tarefa..."
            disabled={adding}
            maxLength={200}
          />
          <button className="btn btn-primary" type="submit" disabled={adding || !newTitle.trim()}
            style={{ width: 'auto', padding: '11px 22px' }}>
            {adding ? '...' : '+ Criar'}
          </button>
        </form>

        <div className="tabs">
          <button className={`tab ${tab === 'ativas' ? 'active' : ''}`} onClick={() => setTab('ativas')}>
            Ativas ({ativas.length})
          </button>
          <button className={`tab ${tab === 'lixeira' ? 'active' : ''}`} onClick={() => setTab('lixeira')}>
            Lixeira ({lixeira.length})
          </button>
        </div>

        <div className="task-list">
          {displayed.length === 0 ? (
            <div className="empty-state">
              <div className="icon">{tab === 'ativas' ? '📋' : '🗑️'}</div>
              <p>{tab === 'ativas' ? 'Nenhuma tarefa ativa. Crie a primeira acima!' : 'Lixeira vazia.'}</p>
            </div>
          ) : (
            displayed.map((task, i) => (
              <TaskItem
                key={task.id}
                task={task}
                index={i}
                onDelete={t => setConfirmDelete(t)}
                onRestore={t => setConfirmRestore(t)}
                onEdit={t => setEditTask(t)}
              />
            ))
          )}
        </div>
      </main>

      {confirmDelete && (
        <ConfirmModal task={confirmDelete} onConfirm={confirmDeleteTask} onCancel={() => setConfirmDelete(null)} />
      )}
      {confirmRestore && (
        <RestoreModal task={confirmRestore} onConfirm={confirmRestoreTask} onCancel={() => setConfirmRestore(null)} />
      )}
      {editTask && (
        <EditModal task={editTask} onConfirm={confirmEditTask} onCancel={() => setEditTask(null)} />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
