'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  title?: string
}

interface State {
  hasError: boolean
}

export default class MovieCardErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('MovieCard error:', error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="movie-card-error-placeholder"
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            aspectRatio: '2/3',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: 16,
          }}
        >
          <span style={{ fontSize: 24 }}>🎬</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
            {this.props.title || 'Could not load'}
          </span>
        </div>
      )
    }

    return this.props.children
  }
}
