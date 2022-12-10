import React, { useEffect } from 'react'
import './App.css'
import { Card, Button, Input, DotLoading } from 'antd-mobile'
import { useDispatch, useSelector } from 'react-redux'
import { chooseCandidate, newGameAsync } from './features/game/gameSlice'

function App () {
  const dispatch = useDispatch()

  const ready = useSelector(state => state.game.status === 'ready')

  useEffect(() => {
    setTimeout(() => dispatch(newGameAsync()), 1000)
  }, [])

  const footer = (
    <p
      style={{ flex: '0', padding: '12px', fontSize: '0.8rem', color: '#bbb' }}
    >
      By <a href='https://milquetoast.space'>milquetoast</a>. Vocabulary from{' '}
      <a href='https://github.com/kerrickstaley/Chinese-Vocab-List'>
        Chinese Vocab List
      </a>
      . Character graphics and data from{' '}
      <a href='https://github.com/skishore/makemeahanzi'>Make me a Hanzi</a>.
    </p>
  )

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
        {ready ? (
          <>
            <Game />
            {footer}
          </>
        ) : (
          <DotLoading />
        )}
      </Card>
    </div>
  )
}

function Game (props) {
  const dispatch = useDispatch()
  const game = useSelector(state => state.game)

  const {
    currentGame,
    chosenCandidates,
    targetPaths,
    candidatePaths,
    score,
    success,
    remaining,
    totalRemaining
  } = game

  const { candidates, candidateStrokes, pinyin, defs } = currentGame

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {!success && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-around',
              flex: '1',
              padding: '20px 15%'
            }}
          >
            {candidates.map(candidate => {
              // all the strokes for this candidate
              const nonMatchingStrokeItems = candidateStrokes[candidate].map(
                (path, index) => ({
                  stroke: path,
                  index
                })
              )

              // matching strokes for this candidate
              const matchingStrokeItems = candidatePaths[candidate] || []

              const allStrokeItems = [
                ...nonMatchingStrokeItems,
                ...matchingStrokeItems
              ]

              return (
                <svg
                  key={candidate}
                  viewBox='0 0 1024 1024'
                  style={{
                    aspectRatio: '1/1',
                    border: `1px solid ${
                      chosenCandidates.includes(candidate)
                        ? 'hsl(197deg 80% 60%)'
                        : '#fefefe'
                    }`,
                    borderRadius: '4px',
                    height: chosenCandidates.includes(candidate)
                      ? '40px'
                      : '32px',
                    margin: chosenCandidates.includes(candidate)
                      ? '4px'
                      : '8px',
                    cursor: success ? 'initial' : 'pointer'
                  }}
                  onClick={() => {
                    if (!success) {
                      dispatch(chooseCandidate(candidate))
                    }
                  }}
                >
                  <g transform='scale(1, -1) translate(0, -900)'>
                    {allStrokeItems.map(
                      ({ stroke, match, index, componentPath }) => (
                        <path
                          className={`path ${match ? 'pathMatch' : ''}`}
                          style={{
                            opacity:
                              chosenCandidates.includes(candidate) && !match
                                ? 0.1
                                : 1
                          }}
                          key={`${stroke} ${index} ${componentPath}`}
                          d={stroke}
                        ></path>
                      )
                    )}
                  </g>
                </svg>
              )
            })}
          </div>
        )}
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
                {targetPaths[i].map(({ stroke }) => {
                  return (
                    <path
                      className={`path pathGuess ${
                        remaining[i] <= 0 ? 'pathSuccess' : ''
                      }`}
                      d={stroke}
                      key={stroke}
                    ></path>
                  )
                })}
              </g>
            </svg>
          ))}
        </div>
      </div>
      {
        <div style={{ flex: '1', fontSize: '1rem' }}>
          {success ? (
            <p>
              <h2>{pinyin}</h2>
              <>
                {defs.map((d, i) => (
                  <span key={d}>
                    {d}
                    {i === defs.length - 1 ? '' : ', '}
                  </span>
                ))}
              </>
            </p>
          ) : (
            <p>
              {`${totalRemaining} stroke${
                totalRemaining > 1 ? 's' : ''
              } remaining`}
            </p>
          )}
          <p>
            <strong>{score}</strong> points
          </p>
          {success && (
            <div style={{ flex: '0' }}>
              <Button onClick={() => dispatch(newGameAsync())}>Next</Button>
            </div>
          )}
        </div>
      }
    </>
  )
}

export default App
