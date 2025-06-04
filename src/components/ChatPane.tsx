import { useState, KeyboardEvent } from 'react'
import { useMessages } from '@/hooks/useMessages'

export default function ChatPane({ agentId }: { agentId?: string }) {
  const { msgs, loading, send } = useMessages(agentId)
  const [draft, setDraft] = useState('')

  const onKey = async (e:KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !draft.trim()) return
    await send('user', draft.trim())
    setDraft('')
  }

  if (!agentId) return <p className="p-4 text-sm text-gray-500">
    Select an agent to start chatting.</p>

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {loading && <p className="text-sm text-gray-400">loading …</p>}
        {msgs.map(m => (
          <div key={m.id}
               className={`max-w-xs rounded-lg px-3 py-2 text-sm
                 ${m.role==='user'
                   ? 'ml-auto bg-blue-600 text-white'
                   : 'mr-auto bg-gray-200 text-gray-800'}`}>
            {m.content}
          </div>
        ))}
      </div>

      <input
        className="border-t p-3 text-sm outline-none"
        placeholder="Type message and hit Enter…"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKey}
      />
    </div>
  )
}