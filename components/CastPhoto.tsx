'use client'

interface CastPhotoProps {
  photo: string | null
  name: string
  initial: string
}

export default function CastPhoto({ photo, name, initial }: CastPhotoProps) {
  if (!photo) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white font-black text-xl" style={{ background: 'linear-gradient(135deg, #D4291A, #8B1A0F)' }}>
        {initial}
      </div>
    )
  }

  return (
    <img
      src={photo}
      alt={name}
      className="w-full h-full object-cover"
      onError={(e) => {
        const target = e.target as HTMLImageElement
        target.style.display = 'none'
        if (target.parentElement) {
          // Safe DOM manipulation instead of innerHTML
          const fallback = document.createElement('div')
          fallback.style.cssText = 'width:100%;height:100%;background:linear-gradient(135deg,#D4291A,#8B1A0F);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1.25rem'
          fallback.textContent = initial
          target.parentElement?.replaceChild(fallback, target)
        }
      }}
    />
  )
}