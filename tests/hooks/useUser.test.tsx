import { renderHook } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import type { User } from "firebase/auth"
import { AuthContext } from "@/context/AuthContext"
import { useUser } from "@/hooks/useUser"

const mockUser = { uid: "abc123", email: "test@example.com" } as User

function makeWrapper(value: { user: User | null; isLoading: boolean }) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    )
  }
}

describe("useUser", () => {
  it("returns { user: null, isLoading: false } when no user is authenticated", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: makeWrapper({ user: null, isLoading: false }),
    })
    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it("returns the user object when a user is authenticated", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: makeWrapper({ user: mockUser, isLoading: false }),
    })
    expect(result.current.user).toBe(mockUser)
    expect(result.current.isLoading).toBe(false)
  })

  it("throws when used outside of AuthProvider", () => {
    expect(() => renderHook(() => useUser())).toThrow(
      "useUser must be used within an AuthProvider"
    )
  })

  it("reflects isLoading: true before the listener fires", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: makeWrapper({ user: null, isLoading: true }),
    })
    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBeNull()
  })

  it("reflects isLoading: false after the listener fires", () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: makeWrapper({ user: null, isLoading: false }),
    })
    expect(result.current.isLoading).toBe(false)
  })
})
