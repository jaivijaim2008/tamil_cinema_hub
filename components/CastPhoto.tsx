'use client'

interface CastPhotoProps {
  photo: string | null
  name: string
  initial: string
}

export default function CastPhoto({ photo, name, initial }: CastPhotoProps) {
  if (!photo) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-violet-700 to-indigo-900 flex items-center justify-center text-white font-black text-xl">
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
          target.parentElement.innerHTML = `<div style="width:100%;height:100%;background:linear-gradient(135deg,#7c3aed,#4338ca);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:1.25rem">${initial}</div>`
        }
      }}
    />
  )
}