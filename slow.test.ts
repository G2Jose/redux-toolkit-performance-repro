import {
  createEntityAdapter,
  createSlice,
  configureStore,
} from '@reduxjs/toolkit'

import { v4 } from 'uuid'

const PARAMETERS = {
  NUM_ITEMS: 100000,
}

type Entity = { id: string; name: string; position: number }

let numSorts = 0

const adaptor = createEntityAdapter({
  selectId: (entity: Entity) => entity.id,
  sortComparer: (a, b) => {
    numSorts++
    if (a.position < b.position) return -1
    else if (a.position > b.position) return 1
    return 0
  },
})

const initialState: Entity[] = new Array(PARAMETERS.NUM_ITEMS)
  .fill(undefined)
  .map((x, i) => ({
    name: `${i}`,
    position: Math.random(),
    id: v4(),
  }))

const entitySlice = createSlice({
  name: 'entity',
  initialState: adaptor.getInitialState(undefined, initialState),
  reducers: {
    upsertOne: adaptor.upsertOne,
    upsertMany: adaptor.upsertMany,
  },
})

const makeStore = () =>
  configureStore({
    reducer: {
      entity: entitySlice.reducer,
    },
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware({ serializableCheck: false })
    },
  })

let store: ReturnType<typeof makeStore>

describe('Redux Toolkit', () => {
  beforeEach(() => {
    numSorts = 0
    store = makeStore()
  })

  it('Upsert an item', () => {
    const lengthBefore = store.getState().entity.ids.length

    const start = new Date().getTime()

    store.dispatch(
      entitySlice.actions.upsertOne({
        id: v4(),
        position: Math.random(),
        name: 'test',
      })
    )

    const end = new Date().getTime()

    const lengthAfter = store.getState().entity.ids.length
    expect(lengthBefore).toEqual(lengthAfter - 1)
    console.log('sortComparer called:', numSorts.toLocaleString(), 'times')
    console.log(
      'Duration to upsert an item:',
      (end - start).toLocaleString(),
      'ms'
    )
  })
})
