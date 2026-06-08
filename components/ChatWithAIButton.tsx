'use client'

export default function ChatWithAIButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event('open-chatbot'))}
      className="relative inline-flex items-center gap-2.5 overflow-hidden rounded-md px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: '#D4291A',
        fontFamily: "'Inter', sans-serif",
        letterSpacing: '0.02em',
        boxShadow: '0 4px 16px rgba(212,41,26,0.3)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#B01F12'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,41,26,0.4)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#D4291A'
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(212,41,26,0.3)'
      }}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" />
        <path d="M2 11h20M2 7l4-4M8 7l4-4M14 7l4-4M20 7l2-2M2 3h20" />
      </svg>
      <span>Chat with AI</span>
    </button>
  )
}
