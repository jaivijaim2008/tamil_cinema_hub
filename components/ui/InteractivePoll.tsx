'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart3, CheckCircle2 } from 'lucide-react'

interface PollOption {
  text: string
  votes: number
}

interface PollData {
  pollId: string
  question: string
  options: PollOption[]
  totalVotes: number
  userVote: number | null
}

interface Props {
  question: string
  options: string[]
  pollId?: string
}

const STORAGE_KEY = 'tamilcinema_poll_votes'

function getStoredVotes(): Record<string, number> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function storeVote(pollId: string, optionIndex: number) {
  if (typeof window === 'undefined') return
  const votes = getStoredVotes()
  votes[pollId] = optionIndex
  localStorage.setItem(STORAGE_KEY, JSON.stringify(votes))
}

export default function InteractivePoll({ question, options, pollId }: Props) {
  const [pollData, setPollData] = useState<PollData | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const id = pollId || `poll-${question.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`

  useEffect(() => {
    // Initialize poll data
    const storedVotes = getStoredVotes()
    const userVote = storedVotes[id] ?? null
    
    // Fetch current vote counts from API
    async function fetchVotes() {
      try {
        const res = await fetch(`/api/polls/vote?pollId=${encodeURIComponent(id)}`)
        if (res.ok) {
          const data = await res.json()
          setPollData({
            pollId: id,
            question,
            options: options.map((text, i) => ({
              text,
              votes: data.optionVotes?.[i] || 0,
            })),
            totalVotes: data.totalVotes || 0,
            userVote,
          })
          return
        }
      } catch {
        // API not available, use empty state
      }
      // Fallback: empty state
      setPollData({
        pollId: id,
        question,
        options: options.map((text) => ({
          text,
          votes: 0,
        })),
        totalVotes: 0,
        userVote,
      })
    }
    
    fetchVotes()
    
    if (userVote !== null) {
      setHasVoted(true)
      setSelectedOption(userVote)
    }
  }, [question, options, id])

  const handleVote = useCallback(async (optionIndex: number) => {
    if (hasVoted || isSubmitting || !pollData) return
    
    setIsSubmitting(true)
    setSelectedOption(optionIndex)
    
    // Store vote locally
    storeVote(id, optionIndex)
    
    // Update local state immediately
    setPollData(prev => {
      if (!prev) return prev
      const newOptions = [...prev.options]
      newOptions[optionIndex] = {
        ...newOptions[optionIndex],
        votes: newOptions[optionIndex].votes + 1,
      }
      return {
        ...prev,
        options: newOptions,
        totalVotes: prev.totalVotes + 1,
        userVote: optionIndex,
      }
    })
    
    setHasVoted(true)
    setIsSubmitting(false)
    
    // Send vote to API endpoint for persistent tracking
    fetch('/api/polls/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: id, optionIndex }),
    }).catch(() => {
      // API not available, vote already stored locally
    })
  }, [hasVoted, isSubmitting, pollData, id])

  if (!pollData) return null

  return (
    <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-bg-card to-bg-elevated border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent-gold/10 flex items-center justify-center">
          <BarChart3 size={18} className="text-accent-gold" />
        </div>
        <div>
          <h3 className="text-base font-bold text-text-primary">{pollData.question}</h3>
          <p className="text-xs text-text-muted">{pollData.totalVotes.toLocaleString()} votes</p>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {pollData.options.map((option, index) => {
          const percentage = pollData.totalVotes > 0 
            ? Math.round((option.votes / pollData.totalVotes) * 100) 
            : 0
          const isSelected = selectedOption === index
          const showResults = hasVoted

          return (
            <button
              key={index}
              onClick={() => handleVote(index)}
              disabled={hasVoted || isSubmitting}
              className={`relative w-full text-left p-4 rounded-xl transition-all duration-300 ${
                showResults
                  ? 'cursor-default'
                  : 'hover:border-accent-gold/50 hover:shadow-lg hover:shadow-accent-gold/10 cursor-pointer'
              } ${
                isSelected
                  ? 'border-2 border-accent-gold bg-accent-gold/10'
                  : 'border border-border bg-bg-card'
              }`}
            >
              {/* Progress bar background */}
              {showResults && (
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-700 ease-out ${
                    isSelected ? 'bg-accent-gold/20' : 'bg-white/5'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {showResults ? (
                    isSelected ? (
                      <CheckCircle2 size={18} className="text-accent-gold shrink-0" />
                    ) : (
                      <div className="w-[18px] h-[18px] rounded-full border-2 border-text-muted/30 shrink-0" />
                    )
                  ) : (
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                      isSelected ? 'border-accent-gold bg-accent-gold' : 'border-text-muted/50'
                    }`} />
                  )}
                  <span className={`text-sm font-medium ${
                    isSelected ? 'text-accent-gold' : 'text-text-primary'
                  }`}>
                    {option.text}
                  </span>
                </div>

                {showResults && (
                  <span className={`text-sm font-bold ${
                    isSelected ? 'text-accent-gold' : 'text-text-muted'
                  }`}>
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer */}
      {hasVoted && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-text-muted">
            ✅ Thanks for voting!
          </p>
          <p className="text-xs text-text-muted">
            {pollData.totalVotes.toLocaleString()} total votes
          </p>
        </div>
      )}
    </div>
  )
}
