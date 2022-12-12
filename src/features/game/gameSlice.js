import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const LAST_GAME = 100

const initialState = {
  status: 'loading',
  currentGame: {},
  chosenCandidates: [],
  gameIndex: 0,
  targetPaths: [],
  candidatePaths: {},
  score: 0,
  guessCount: 0,
  success: false,
  totalRemaining: null,
  remaining: null
}

function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const order = new Array(LAST_GAME).fill(0).map((_, index) => index + 1)
shuffleArray(order)

export const newGameAsync = createAsyncThunk(
  'game/new',
  async (_, thunkAPI) => {
    const { game } = thunkAPI.getState()
    const { gameIndex } = game
    const next = gameIndex + 1 > LAST_GAME ? 1 : gameIndex + 1
    const response = await axios.get(
      `${process.env.PUBLIC_URL}/games/game_${order[next]}.json`
    )
    return response.data
  }
)

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    chooseCandidate: (state, action) => {
      const chosen = action.payload
      state.chosenCandidates.push(chosen)

      const guessCount = state.guessCount + 1
      state.guessCount = guessCount

      const { candidateCommonStrokes, targetNumStrokes } = state.currentGame

      // calculate new paths

      const thisCandidateCommonStrokes = candidateCommonStrokes[
        chosen
      ].reverse.flat()

      // strokes for this candidate that match one of the target characters
      const matchingStrokeItems = thisCandidateCommonStrokes
        .filter(x => {
          // only include strokes that have not already shown up in other clicked candidates
          const previousMatches = state.chosenCandidates
            .slice(0, state.chosenCandidates.indexOf(chosen))
            .map(
              character =>
                candidateCommonStrokes[character] &&
                candidateCommonStrokes[character].reverse
            )
            .flat(2)
            .filter(x => x)

          const previousHeads = previousMatches.map(({ componentPath }) =>
            componentPath.substring(
              componentPath.length - 1,
              componentPath.length
            )
          )

          const thisHead = x.componentPath.substring(
            x.componentPath.length - 1,
            x.componentPath.length
          )
          const result =
            !thisCandidateCommonStrokes.some(({ componentPath, stroke }) => {
              return (
                componentPath.includes(`${thisHead}/`) && stroke === x.stroke
              )
            }) && !previousHeads.some(previousHead => previousHead === thisHead)
          return result
        })
        .map(x => ({
          ...x,
          match: true
        }))

      state.candidatePaths[chosen] = matchingStrokeItems

      const newTargetPaths = state.targetPaths.map((target, index) => {
        const strokeItemsToAdd = candidateCommonStrokes[chosen].forward[
          index
        ].filter(
          ({ stroke }) => !target.map(({ stroke }) => stroke).includes(stroke)
        )
        const strokeItemsToAddDistinctByStroke = strokeItemsToAdd.filter(
          (item, index) =>
            strokeItemsToAdd.findIndex(
              ({ stroke }) => stroke === item.stroke
            ) === index
        )
        return [...target, ...strokeItemsToAddDistinctByStroke]
      })

      state.targetPaths = newTargetPaths

      state.remaining = newTargetPaths.map((paths, index) => {
        return targetNumStrokes[index] - paths.length
      })

      const totalRemaining = state.remaining.reduce((a, b) => a + b, 0)
      state.success = totalRemaining <= 0

      const pointRanking = [5, 5, 4, 4, 3, 3, 2, 2]
      const pointsMultiplier = pointRanking[guessCount - 1] || 1

      state.score += Math.ceil(
        ((state.totalRemaining - totalRemaining) * pointsMultiplier) / 10
      )
      state.totalRemaining = totalRemaining
    }
  },
  extraReducers: builder => {
    builder
      .addCase(newGameAsync.pending, (state, action) => {
        state.status = 'loading'
      })
      .addCase(newGameAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        const {
          candidates,
          candidateStrokes,
          candidateCommonStrokes,
          targetNumStrokes,
          pinyin,
          defs
        } = action.payload

        state.currentGame = {
          candidates,
          candidateStrokes,
          candidateCommonStrokes,
          targetNumStrokes,
          pinyin,
          defs
        }
        state.success = false
        state.guessCount = 0
        state.candidatePaths = {}
        state.targetPaths = [[], []]
        state.chosenCandidates = []
        state.totalRemaining = targetNumStrokes.reduce((a, b) => a + b, 0)
        state.remaining = targetNumStrokes
        state.gameIndex =
          state.gameIndex + 1 > LAST_GAME ? 1 : state.gameIndex + 1
        state.status = 'ready'
      })
  }
})

export const { chooseCandidate } = gameSlice.actions

export default gameSlice.reducer
