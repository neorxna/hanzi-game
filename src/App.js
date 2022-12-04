import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import { Card, Button, Input } from 'antd-mobile'
import config from './config.json'

const {
  candidates,
  candidateStrokes,
  candidateCommonStrokes,
  targetNumCharacters,
  targetNumStrokes,
  radicalHints
} = config

function App () {
  const [paths, setPaths] = useState([])
  const [chosen, setChosen] = useState([])
  const [guessCount, setGuessCount] = useState(0)
  const [success, setSuccess] = useState(false)

  /*
  useEffect(() => {
    fetchPaths('__radical__')
  }, [])

  const fetchPaths = _guess => {
    setLoading(true)
    ;(async () => {
      const url = `${API_URL}/character/stroke-match/${_guess}`
      const result = await axios.get(url)
      if (result.data && result.data.paths) {
        setSuccess(result.data.success)
        setPaths(existingPaths => {
          const existingIndices = existingPaths.map(({ index }) => index)
          const newPaths = result.data.paths.filter(
            ({ index }) => !existingIndices.includes(index)
          )
          return [...existingPaths, ...newPaths]
        })
      }
      setLoading(false)
    })()
  }*/

  const remaining = targetNumStrokes.map((targetStrokes, index) => {
    const numStrokes = new Set(
      paths
        .map(p => p.forward)
        .map(p => p[index])
        .flat()
        .map(p => p.stroke)
    ).size
    return targetStrokes - numStrokes
  })
  const totalRemaining = remaining.reduce((a, b) => a + b, 0)

  return (
    <div className='App'>
      <Card
        style={{
          width: '100%',
          background: 'rgb(255,255,255,0.8)',
          fontSize: '2rem'
        }}
        //title='上字'
        titleStyle={{ fontSize: '4rem' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              justifyContent: 'space-between',
              flex: '1',
              padding: '0px 15%'
            }}
          >
            {candidates.map(candidate => (
              <svg
                key={candidate}
                viewBox='0 0 1024 1024'
                style={{
                  aspectRatio: '1/1',
                  border: '1px solid #fefefe',
                  borderRadius: '4px',
                  height: '30px',
                  margin: '8px'
                }}
                onClick={() => {
                  setPaths(existing => [
                    ...existing,
                    candidateCommonStrokes[candidate]
                  ])
                  setChosen(existing => [...existing, candidate])
                  setGuessCount(g => (g += 1))
                }}
              >
                <g transform='scale(1, -1) translate(0, -900)'>
                  {[
                    ...candidateStrokes[candidate].map((path, index) => ({
                      stroke: path,
                      index
                    })),
                    ...(chosen.includes(candidate)
                      ? candidateCommonStrokes[candidate].reverse
                          .flat()
                          .map(x => ({ ...x, match: true }))
                      : [])
                  ].map(({ stroke, match, index }) => (
                    <path
                      className={`path ${match ? 'pathRadical' : ''}`}
                      style={{
                        opacity: chosen.includes(candidate) && !match ? 0.1 : 1
                      }}
                      key={index}
                      d={stroke}
                    ></path>
                  ))}
                </g>
              </svg>
            ))}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '1'
          }}
        >
          <div style={{ flex: '1' }}>
            {[0, 1].map((_, i) => (
              <svg
                key={i}
                style={{
                  height: '20vh',
                  margin: '0.5rem',
                  aspectRatio: '1/1',
                  border: `2px solid ${
                    remaining[i] <= 0 ? 'hsl(120deg 80% 60%)' : '#e0e0e0'
                  }`,
                  borderRadius: '8px'
                }}
                viewBox='0 0 1024 1024'
              >
                <g transform='scale(1, -1) translate(0, -900)'>
                  {paths
                    .map(p => p['forward'][i])
                    .flat()
                    .map(({ index, stroke, radical }) => {
                      return (
                        <path
                          className={`path ${
                            radical ? 'pathRadical' : 'pathGuess'
                          } ${remaining[i] <= 0 ? 'pathSuccess' : ''}`}
                          d={stroke}
                          key={index}
                        ></path>
                      )
                    })}
                </g>
              </svg>
            ))}
          </div>
        </div>
        <p>{guessCount > 0 && guessCount.toLocaleString('zh-u-nu-hanidec')}</p>
        {
          <p style={{ fontSize: '1rem' }}>
            {totalRemaining <= 0
              ? 'complete!'
              : `${totalRemaining} stroke${
                  totalRemaining > 1 ? 's' : ''
                } remaining`}
          </p>
        }
        <p style={{ flex: '0', fontSize: '1rem', color: '#bbb' }}>
          by{' '}
          <a
            style={{ color: '#bbb', textDecoration: 'none' }}
            href='https://milquetoast.space'
          >
            milquetoast
          </a>
        </p>
      </Card>
    </div>
  )
}

export default App
