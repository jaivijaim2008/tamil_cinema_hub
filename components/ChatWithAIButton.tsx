'use client'

export default function ChatWithAIButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
      className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-md px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, #D4291A, #7C3AED)',
        fontFamily: "'Syne', sans-serif",
        fontWeight: 800,
        letterSpacing: '0.02em',
        boxShadow: '0 8px 32px rgba(212,41,26,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,41,26,0.5), 0 0 20px rgba(124,58,237,0.3), 0 0 0 1px rgba(255,255,255,0.15)'
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,41,26,0.4), 0 0 0 1px rgba(255,255,255,0.1)'
        e.currentTarget.style.transform = ''
      }}
    >
      <span>🎬</span>
      <span>Start Chatting with AI</span>
    </button>
  )
}
