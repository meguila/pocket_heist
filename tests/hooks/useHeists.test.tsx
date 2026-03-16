import { renderHook, act } from "@testing-library/react"
import { vi } from "vitest"
import type { User } from "firebase/auth"

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  db: {},
}))

vi.mock("@/hooks/useUser", () => ({
  useUser: vi.fn(),
}))

import { collection, query, where, onSnapshot } from "firebase/firestore"
import { useUser } from "@/hooks/useUser"
import { useHeists } from "@/hooks/useHeists"

const mockUser = { uid: "user-1" } as User
const unsubMock = vi.fn()

function makeSnapshot(items: ReturnType<typeof makeMockHeist>[]) {
  return { docs: items.map((h) => ({ data: () => h })) }
}

function makeMockHeist(overrides = {}) {
  return {
    id: "heist-1",
    title: "The Diamond Job",
    description: "Steal the diamond",
    createdBy: "user-2",
    createdByCodename: "Ghost",
    assignedTo: "user-1",
    assignedToCodename: "Shadow",
    deadline: new Date("2099-01-01"),
    finalStatus: null,
    createdAt: new Date(),
    ...overrides,
  }
}

describe("useHeists", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(collection).mockReturnValue({
      withConverter: vi.fn().mockReturnValue("colRef"),
    } as never)
    vi.mocked(query).mockReturnValue("mockQuery" as never)
    vi.mocked(where).mockReturnValue("mockWhere" as never)
  })

  it("returns empty data and loading:false when user is null", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false })

    const { result } = renderHook(() => useHeists("active"))

    expect(result.current.data).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(onSnapshot).not.toHaveBeenCalled()
  })

  it("queries by assignedTo and deadline for active mode", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([]))
      return unsubMock
    })

    renderHook(() => useHeists("active"))

    expect(vi.mocked(where)).toHaveBeenCalledWith("assignedTo", "==", "user-1")
    expect(vi.mocked(where)).toHaveBeenCalledWith("deadline", ">", expect.any(Date))
  })

  it("queries by createdBy and deadline for assigned mode", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([]))
      return unsubMock
    })

    renderHook(() => useHeists("assigned"))

    expect(vi.mocked(where)).toHaveBeenCalledWith("createdBy", "==", "user-1")
    expect(vi.mocked(where)).toHaveBeenCalledWith("deadline", ">", expect.any(Date))
  })

  it("queries by deadline and finalStatus for expired mode", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([]))
      return unsubMock
    })

    renderHook(() => useHeists("expired"))

    expect(vi.mocked(where)).toHaveBeenCalledWith("deadline", "<=", expect.any(Date))
    expect(vi.mocked(where)).toHaveBeenCalledWith("finalStatus", "!=", null)
  })

  it("returns mapped Heist objects when snapshot fires", async () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
    const heist = makeMockHeist()

    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([heist]))
      return unsubMock
    })

    const { result } = renderHook(() => useHeists("active"))

    await act(async () => {})

    expect(result.current.data).toEqual([heist])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("calls unsubscribe on unmount", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })
    vi.mocked(onSnapshot).mockImplementation((_q, onNext) => {
      onNext(makeSnapshot([]))
      return unsubMock
    })

    const { unmount } = renderHook(() => useHeists("active"))
    unmount()

    expect(unsubMock).toHaveBeenCalled()
  })
})
