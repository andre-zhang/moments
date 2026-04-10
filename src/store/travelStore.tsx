import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import {
  clearAllPhotos,
  deleteAllPhotosForMemories,
  deleteAllPhotosForMemory,
} from '../db/photosDb'
import { mergeSelectionLists } from '../lib/mergeSelectionLists'
import type {
  Destination,
  Friend,
  Memory,
  SelectionList,
  TagCategory,
  Trip,
} from '../types'
import {
  TRIPLESS_DEFAULT_DEST_ID,
  TRIPLESS_TRIP_ID,
  withTriplessInfrastructure,
} from '../lib/tripless'
import { cloneDefaultSelectionLists } from '../whimsy/selectionLists'
import {
  cloneDefaultCategories,
  DEFAULT_TAG_CATEGORIES,
} from '../whimsy/tagLibrary'
import {
  cancelScheduledRemoteSave,
  fetchRemoteState,
  flushRemoteSaveNow,
  markRemotePersistenceFailed,
  remotePersistenceActive,
  scheduleRemoteSave,
} from '../lib/remotePersistence'
import { isNeonSyncEnabled } from '../lib/syncEnv'
import { getDemoPersistedState, seedIfEmpty } from './seed'

const STORAGE_V2 = 'moments-travel-v2'
const STORAGE_V1 = 'moments-travel-v1'
const LEGACY_STORAGE_V2 = 'wanderlog-travel-v2'
const LEGACY_STORAGE_V1 = 'wanderlog-travel-v1'

export interface TravelState {
  trips: Trip[]
  destinations: Destination[]
  memories: Memory[]
  friends: Friend[]
  tagCategories: TagCategory[]
  selectionLists: SelectionList[]
  selectedTripId: string | null
  landedMemoryIds: string[]
  tripLinePlayKey: number
  uiSoundEnabled: boolean
}

export type PersistedState = Omit<TravelState, 'landedMemoryIds' | 'tripLinePlayKey'>

type Action =
  | { type: 'hydrate'; payload: PersistedState }
  | { type: 'selectTrip'; tripId: string | null }
  | { type: 'replayTripLines' }
  | { type: 'addMemory'; memory: Memory }
  | { type: 'updateMemory'; memory: Memory }
  | { type: 'deleteMemory'; id: string }
  | { type: 'addFriend'; friend: Friend }
  | { type: 'updateFriend'; friend: Friend }
  | { type: 'removeFriend'; id: string }
  | { type: 'setTagCategories'; categories: TagCategory[] }
  | { type: 'setSelectionLists'; lists: SelectionList[] }
  | { type: 'setUiSoundEnabled'; value: boolean }
  | { type: 'addTrip'; trip: Trip }
  | { type: 'updateTrip'; trip: Trip }
  | { type: 'deleteTrip'; tripId: string }
  | { type: 'addDestination'; destination: Destination }
  | { type: 'updateDestination'; destination: Destination }
  | { type: 'deleteDestination'; destinationId: string }
  | { type: 'importState'; payload: PersistedState }
  | { type: 'clearLandings' }

const initial: TravelState = {
  trips: [],
  destinations: [],
  memories: [],
  friends: [],
  tagCategories: cloneDefaultCategories(),
  selectionLists: cloneDefaultSelectionLists(),
  selectedTripId: null,
  landedMemoryIds: [],
  tripLinePlayKey: 0,
  uiSoundEnabled: true,
}

function stripFriendFromMemories(memories: Memory[], friendId: string): Memory[] {
  return memories.map((m) => {
    const ids = m.friendIds?.filter((x) => x !== friendId)
    if (!ids || ids.length === m.friendIds?.length) return m
    return { ...m, friendIds: ids.length ? ids : undefined }
  })
}

function reducer(state: TravelState, action: Action): TravelState {
  switch (action.type) {
    case 'hydrate': {
      const merged = withTriplessInfrastructure(action.payload)
      return {
        ...state,
        ...merged,
        tagCategories:
          merged.tagCategories?.length
            ? merged.tagCategories
            : cloneDefaultCategories(),
        selectionLists:
          merged.selectionLists?.length
            ? merged.selectionLists
            : cloneDefaultSelectionLists(),
        friends: merged.friends ?? [],
        uiSoundEnabled: merged.uiSoundEnabled ?? true,
        landedMemoryIds: [],
      }
    }
    case 'selectTrip':
      return {
        ...state,
        selectedTripId: action.tripId,
        tripLinePlayKey: state.tripLinePlayKey + 1,
      }
    case 'replayTripLines':
      return { ...state, tripLinePlayKey: state.tripLinePlayKey + 1 }
    case 'addMemory':
      return {
        ...state,
        memories: [...state.memories, action.memory],
        landedMemoryIds: [...state.landedMemoryIds, action.memory.id],
      }
    case 'updateMemory':
      return {
        ...state,
        memories: state.memories.map((m) =>
          m.id === action.memory.id ? action.memory : m
        ),
      }
    case 'deleteMemory':
      return {
        ...state,
        memories: state.memories.filter((m) => m.id !== action.id),
      }
    case 'addFriend':
      return { ...state, friends: [...state.friends, action.friend] }
    case 'updateFriend':
      return {
        ...state,
        friends: state.friends.map((f) =>
          f.id === action.friend.id ? action.friend : f
        ),
      }
    case 'removeFriend':
      return {
        ...state,
        friends: state.friends.filter((f) => f.id !== action.id),
        memories: stripFriendFromMemories(state.memories, action.id),
      }
    case 'setTagCategories':
      return { ...state, tagCategories: action.categories }
    case 'setSelectionLists':
      return { ...state, selectionLists: action.lists }
    case 'setUiSoundEnabled':
      return { ...state, uiSoundEnabled: action.value }
    case 'addTrip':
      return { ...state, trips: [...state.trips, action.trip] }
    case 'updateTrip':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.trip.id ? action.trip : t
        ),
      }
    case 'deleteTrip':
      if (action.tripId === TRIPLESS_TRIP_ID) return state
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.tripId),
        destinations: state.destinations.filter(
          (d) => d.tripId !== action.tripId
        ),
        memories: state.memories.filter((m) => m.tripId !== action.tripId),
        selectedTripId:
          state.selectedTripId === action.tripId ? null : state.selectedTripId,
      }
    case 'addDestination':
      return {
        ...state,
        destinations: [...state.destinations, action.destination],
      }
    case 'updateDestination':
      return {
        ...state,
        destinations: state.destinations.map((d) =>
          d.id === action.destination.id ? action.destination : d
        ),
      }
    case 'deleteDestination':
      if (action.destinationId === TRIPLESS_DEFAULT_DEST_ID) return state
      return {
        ...state,
        destinations: state.destinations.filter(
          (d) => d.id !== action.destinationId
        ),
        memories: state.memories.filter(
          (m) => m.destinationId !== action.destinationId
        ),
      }
    case 'importState': {
      const merged = withTriplessInfrastructure(action.payload)
      return {
        ...state,
        ...merged,
        tagCategories:
          merged.tagCategories?.length
            ? merged.tagCategories
            : cloneDefaultCategories(),
        selectionLists:
          merged.selectionLists?.length
            ? merged.selectionLists
            : cloneDefaultSelectionLists(),
        friends: merged.friends ?? [],
        uiSoundEnabled: merged.uiSoundEnabled ?? true,
        landedMemoryIds: [],
      }
    }
    case 'clearLandings':
      return { ...state, landedMemoryIds: [] }
    default:
      return state
  }
}

export function normalizePersisted(p: Partial<PersistedState>): PersistedState {
  const rawCats =
    p.tagCategories?.length &&
    p.tagCategories.some((c) => (c.tags?.length ?? 0) > 0)
      ? p.tagCategories
      : cloneDefaultCategories()
  return {
    trips: p.trips ?? [],
    destinations: p.destinations ?? [],
    memories: (p.memories ?? []).map((m) => ({ ...m })),
    friends: (p.friends ?? []).map((f) => ({ ...f })),
    tagCategories: rawCats.map((c) => {
      const def = DEFAULT_TAG_CATEGORIES.find((x) => x.id === c.id)
      return {
        ...c,
        tags: [...(c.tags ?? [])],
        tagColors: { ...(c.tagColors ?? {}) },
        appliesToKinds:
          c.appliesToKinds != null && c.appliesToKinds.length > 0
            ? [...c.appliesToKinds]
            : def?.appliesToKinds
              ? [...def.appliesToKinds]
              : undefined,
      }
    }),
    selectionLists: mergeSelectionLists(p.selectionLists),
    selectedTripId: p.selectedTripId ?? null,
    uiSoundEnabled: p.uiSoundEnabled ?? true,
  }
}

function migrateV1(raw: string): PersistedState | null {
  try {
    const p = JSON.parse(raw) as Partial<PersistedState>
    if (!p.memories && !p.trips) return null
    return withTriplessInfrastructure(
      normalizePersisted({
        trips: p.trips ?? [],
        destinations: p.destinations ?? [],
        memories: p.memories ?? [],
        friends: [],
        tagCategories: cloneDefaultCategories(),
        selectedTripId: p.selectedTripId ?? null,
        uiSoundEnabled: true,
      })
    )
  } catch {
    return null
  }
}

function loadPersisted(): PersistedState | null {
  const v2 =
    localStorage.getItem(STORAGE_V2) ?? localStorage.getItem(LEGACY_STORAGE_V2)
  if (v2) {
    try {
      const p = JSON.parse(v2) as Partial<PersistedState>
      return withTriplessInfrastructure(normalizePersisted(p))
    } catch {
      /* fall through */
    }
  }
  const v1 =
    localStorage.getItem(STORAGE_V1) ?? localStorage.getItem(LEGACY_STORAGE_V1)
  if (v1) {
    const m = migrateV1(v1)
    if (m) return m
  }
  return null
}

interface Ctx {
  state: TravelState
  selectTrip: (id: string | null) => void
  replayTripLines: () => void
  addMemory: (m: Memory) => void
  updateMemory: (m: Memory) => void
  deleteMemory: (id: string) => void
  addFriend: (f: Friend) => void
  updateFriend: (f: Friend) => void
  removeFriend: (id: string) => void
  setTagCategories: (c: TagCategory[]) => void
  setSelectionLists: (l: SelectionList[]) => void
  setUiSoundEnabled: (v: boolean) => void
  addTrip: (t: Trip) => void
  updateTrip: (t: Trip) => void
  deleteTrip: (tripId: string) => void
  addDestination: (d: Destination) => void
  updateDestination: (d: Destination) => void
  deleteDestination: (destinationId: string) => void
  importBackup: (json: string) => void
  exportBackup: () => string
  resetToDemo: () => Promise<void>
}

const TravelContext = createContext<Ctx | null>(null)

export function TravelProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial)
  const persistReady = useRef(false)

  useEffect(() => {
    let cancelled = false
    async function go() {
      if (isNeonSyncEnabled()) {
        try {
          const data = await fetchRemoteState()
          if (cancelled) return
          if (data != null && typeof data === 'object' && !Array.isArray(data)) {
            dispatch({
              type: 'hydrate',
              payload: normalizePersisted(data as Partial<PersistedState>),
            })
          } else {
            const fromLocal = loadPersisted()
            if (fromLocal) {
              dispatch({ type: 'hydrate', payload: fromLocal })
              void flushRemoteSaveNow(fromLocal).catch(() => {
                markRemotePersistenceFailed()
              })
            } else {
              const seed = seedIfEmpty()
              dispatch({ type: 'hydrate', payload: seed })
              void flushRemoteSaveNow(seed).catch(() => {
                markRemotePersistenceFailed()
              })
            }
          }
        } catch {
          markRemotePersistenceFailed()
          if (cancelled) return
          const persisted = loadPersisted()
          if (persisted) {
            dispatch({ type: 'hydrate', payload: persisted })
          } else {
            dispatch({ type: 'hydrate', payload: seedIfEmpty() })
          }
        }
      } else {
        const persisted = loadPersisted()
        if (persisted) {
          dispatch({ type: 'hydrate', payload: persisted })
        } else {
          dispatch({ type: 'hydrate', payload: seedIfEmpty() })
        }
      }
      if (!cancelled) {
        persistReady.current = true
      }
    }
    void go()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!persistReady.current) return
    const { landedMemoryIds, tripLinePlayKey, ...rest } = state
    void landedMemoryIds
    void tripLinePlayKey
    if (remotePersistenceActive()) {
      scheduleRemoteSave(rest)
    } else {
      localStorage.setItem(STORAGE_V2, JSON.stringify(rest))
      localStorage.removeItem(LEGACY_STORAGE_V2)
      localStorage.removeItem(LEGACY_STORAGE_V1)
    }
  }, [state])

  useEffect(() => () => cancelScheduledRemoteSave(), [])

  useEffect(() => {
    if (state.landedMemoryIds.length === 0) return
    const t = window.setTimeout(() => {
      dispatch({ type: 'clearLandings' })
    }, 700)
    return () => window.clearTimeout(t)
  }, [state.landedMemoryIds])

  const selectTrip = useCallback((id: string | null) => {
    dispatch({ type: 'selectTrip', tripId: id })
  }, [])

  const replayTripLines = useCallback(() => {
    dispatch({ type: 'replayTripLines' })
  }, [])

  const addMemory = useCallback((m: Memory) => {
    dispatch({ type: 'addMemory', memory: m })
  }, [])

  const updateMemory = useCallback((m: Memory) => {
    dispatch({ type: 'updateMemory', memory: m })
  }, [])

  const deleteMemory = useCallback((id: string) => {
    void deleteAllPhotosForMemory(id)
    dispatch({ type: 'deleteMemory', id })
  }, [])

  const addFriend = useCallback((f: Friend) => {
    dispatch({ type: 'addFriend', friend: f })
  }, [])

  const updateFriend = useCallback((f: Friend) => {
    dispatch({ type: 'updateFriend', friend: f })
  }, [])

  const removeFriend = useCallback((id: string) => {
    dispatch({ type: 'removeFriend', id })
  }, [])

  const setTagCategories = useCallback((categories: TagCategory[]) => {
    dispatch({ type: 'setTagCategories', categories })
  }, [])

  const setSelectionLists = useCallback((lists: SelectionList[]) => {
    dispatch({ type: 'setSelectionLists', lists })
  }, [])

  const setUiSoundEnabled = useCallback((value: boolean) => {
    dispatch({ type: 'setUiSoundEnabled', value })
  }, [])

  const addTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'addTrip', trip })
  }, [])

  const updateTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'updateTrip', trip })
  }, [])

  const deleteTrip = useCallback(
    (tripId: string) => {
      if (tripId === TRIPLESS_TRIP_ID) return
      const ids = state.memories
        .filter((m) => m.tripId === tripId)
        .map((m) => m.id)
      void deleteAllPhotosForMemories(ids)
      dispatch({ type: 'deleteTrip', tripId })
    },
    [state.memories]
  )

  const addDestination = useCallback((destination: Destination) => {
    dispatch({ type: 'addDestination', destination })
  }, [])

  const updateDestination = useCallback((destination: Destination) => {
    dispatch({ type: 'updateDestination', destination })
  }, [])

  const deleteDestination = useCallback(
    (destinationId: string) => {
      if (destinationId === TRIPLESS_DEFAULT_DEST_ID) return
      const ids = state.memories
        .filter((m) => m.destinationId === destinationId)
        .map((m) => m.id)
      void deleteAllPhotosForMemories(ids)
      dispatch({ type: 'deleteDestination', destinationId })
    },
    [state.memories]
  )

  const exportBackup = useCallback(() => {
    const { landedMemoryIds, tripLinePlayKey, ...rest } = state
    void landedMemoryIds
    void tripLinePlayKey
    return JSON.stringify(rest, null, 2)
  }, [state])

  const importBackup = useCallback((json: string) => {
    const p = JSON.parse(json) as Partial<PersistedState>
    const payload = withTriplessInfrastructure(normalizePersisted(p))
    dispatch({
      type: 'importState',
      payload,
    })
    if (remotePersistenceActive()) {
      void flushRemoteSaveNow(payload).catch(() => markRemotePersistenceFailed())
    }
  }, [])

  const resetToDemo = useCallback(async () => {
    await clearAllPhotos()
    const demo = getDemoPersistedState()
    dispatch({ type: 'importState', payload: demo })
    if (remotePersistenceActive()) {
      await flushRemoteSaveNow(demo).catch(() => markRemotePersistenceFailed())
    }
  }, [])

  const value = useMemo(
    () => ({
      state,
      selectTrip,
      replayTripLines,
      addMemory,
      updateMemory,
      deleteMemory,
      addFriend,
      updateFriend,
      removeFriend,
      setTagCategories,
      setSelectionLists,
      setUiSoundEnabled,
      addTrip,
      updateTrip,
      deleteTrip,
      addDestination,
      updateDestination,
      deleteDestination,
      importBackup,
      exportBackup,
      resetToDemo,
    }),
    [
      state,
      selectTrip,
      replayTripLines,
      addMemory,
      updateMemory,
      deleteMemory,
      addFriend,
      updateFriend,
      removeFriend,
      setTagCategories,
      setSelectionLists,
      setUiSoundEnabled,
      addTrip,
      updateTrip,
      deleteTrip,
      addDestination,
      updateDestination,
      deleteDestination,
      importBackup,
      exportBackup,
      resetToDemo,
    ]
  )

  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  )
}

export function useTravel() {
  const c = useContext(TravelContext)
  if (!c) throw new Error('useTravel outside TravelProvider')
  return c
}
