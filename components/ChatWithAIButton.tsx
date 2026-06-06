'use client'

export default function ChatWithAIButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}
      className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold text-white transition-all active:scale-95 hover:shadow-[0_8px_40px_rgba(109,40,217,0.5)]"
      style={{ background: 'linear-gradient(135deg, #7c3aed, #f97316)' }}
      aria-label="Open chatbot"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      Chat with AI
    </button>
  )
}
