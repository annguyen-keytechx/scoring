import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const MAX_SCORE = 9

type Scores = {
  vn: number
  cn: number
}

const starPoints =
  '50 5 61 39 98 39 68 59 79 91 50 70 21 91 32 59 2 39 39 39'

const VietnamFlag = () => (
  <svg className="flag" viewBox="0 0 100 60" role="img" aria-label="Vietnam flag">
    <rect width="100" height="60" fill="#da251d" />
    <polygon
      fill="#ffde00"
      points="50 9 56 26 74 26 59 37 65 54 50 44 35 54 41 37 26 26 44 26"
    />
  </svg>
)

const ChinaFlag = () => (
  <svg className="flag" viewBox="0 0 100 60" role="img" aria-label="China flag">
    <rect width="100" height="60" fill="#de2910" />
    <g fill="#ffde00">
      <g transform="translate(6 6) scale(0.25)">
        <polygon points={starPoints} />
      </g>
      <g transform="translate(28 6) scale(0.12)">
        <polygon points={starPoints} />
      </g>
      <g transform="translate(34 16) scale(0.12)">
        <polygon points={starPoints} />
      </g>
      <g transform="translate(34 30) scale(0.12)">
        <polygon points={starPoints} />
      </g>
      <g transform="translate(28 40) scale(0.12)">
        <polygon points={starPoints} />
      </g>
    </g>
  </svg>
)

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  ttl: number
  size: number
  color: string
}

const Fireworks = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrame = 0
    let burstTimer = 0
    const particles: Particle[] = []
    const colors = ['#ffd166', '#ef476f', '#06d6a0', '#118ab2', '#ff9f1c']

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const spawnBurst = () => {
      const count = 60
      const centerX = canvas.width * (0.2 + Math.random() * 0.6)
      const centerY = canvas.height * (0.2 + Math.random() * 0.4)
      const color = colors[Math.floor(Math.random() * colors.length)]
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 3.5
        particles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          life: 0,
          ttl: 50 + Math.random() * 30,
          size: 1.5 + Math.random() * 2.5,
          color,
        })
      }
    }

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i]
        p.life += 1
        p.vx *= 0.99
        p.vy = p.vy * 0.99 + 0.04
        p.x += p.vx
        p.y += p.vy

        const alpha = Math.max(0, 1 - p.life / p.ttl)
        ctx.globalAlpha = alpha
        ctx.beginPath()
        ctx.fillStyle = p.color
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        if (p.life >= p.ttl) {
          particles.splice(i, 1)
        }
      }
      ctx.globalAlpha = 1
    }

    const loop = () => {
      update()
      animationFrame = window.requestAnimationFrame(loop)
    }

    resize()
    window.addEventListener('resize', resize)
    spawnBurst()
    burstTimer = window.setInterval(spawnBurst, 260)
    loop()

    const stopTimer = window.setTimeout(() => {
      window.clearInterval(burstTimer)
      window.cancelAnimationFrame(animationFrame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }, 2800)

    return () => {
      window.clearInterval(burstTimer)
      window.clearTimeout(stopTimer)
      window.cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fireworks" aria-hidden="true" />
}

const randomScore = (lambda: number) => {
  const limit = Math.exp(-lambda)
  let k = 0
  let p = 1
  while (p > limit && k < MAX_SCORE) {
    k += 1
    p *= Math.random()
  }
  return Math.min(k - 1, MAX_SCORE)
}

function App() {
  const [scores, setScores] = useState<Scores | null>(null)
  const [fireworksKey, setFireworksKey] = useState(0)

  const result = useMemo(() => {
    if (!scores) {
      return { text: 'Tap predict to reveal the score.', tone: 'idle' }
    }
    if (scores.vn > scores.cn) {
      return { text: 'Vietnam takes it. Fireworks time!', tone: 'win' }
    }
    if (scores.vn < scores.cn) {
      return { text: 'China edges ahead. Run it back.', tone: 'lose' }
    }
    return { text: 'Dead even. Rivalry stays hot.', tone: 'draw' }
  }, [scores])

  const handlePredict = () => {
    const vnScore = randomScore(2.1)
    const cnScore = randomScore(2.1)
    setScores({ vn: vnScore, cn: cnScore })
    if (vnScore > cnScore) {
      setFireworksKey((key) => key + 1)
    }
  }

  return (
    <div className="app">
      {scores && scores.vn > scores.cn && <Fireworks key={fireworksKey} />}
      <header className="hero">
        <p className="eyebrow">U23 Score Predictor</p>
        <h1>Vietnam U23 vs China U23</h1>
        <p className="sub">
          Press the button for a quick, biased prediction up to {MAX_SCORE} goals.
        </p>
      </header>

      <section className="board" aria-live="polite">
        <div className="team-card">
          <VietnamFlag />
          <div className="team-name">Vietnam U23</div>
          <div className="score">{scores ? scores.vn : '-'}</div>
        </div>
        <div className="versus">VS</div>
        <div className="team-card">
          <ChinaFlag />
          <div className="team-name">China U23</div>
          <div className="score">{scores ? scores.cn : '-'}</div>
        </div>
      </section>

      <section className="cta">
        <button className="predict-btn" onClick={handlePredict}>
          Predict the score
        </button>
        <p className={`result ${result.tone}`}>{result.text}</p>
      </section>
    </div>
  )
}

export default App
