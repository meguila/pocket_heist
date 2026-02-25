import { render, screen, waitFor } from "@testing-library/react"
import { vi, beforeEach, describe, it, expect } from "vitest"
import type { User } from "firebase/auth"
import { useUser } from "@/hooks/useUser"

vi.mock("@/hooks/useUser")
vi.mock("@/components/PageLoader", () => ({
  default: () => <div data-testid="page-loader" />,
}))

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

// import layout after mocks are set up
import PublicLayout from "@/app/(public)/layout"

const mockUser = { uid: "abc123", email: "test@example.com" } as User

beforeEach(() => {
  vi.clearAllMocks()
})

describe("PublicLayout", () => {
  it("shows the loader while auth is resolving", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: true })

    render(
      <PublicLayout>
        <p>child content</p>
      </PublicLayout>
    )

    expect(screen.getByTestId("page-loader")).toBeInTheDocument()
    expect(screen.queryByText("child content")).not.toBeInTheDocument()
  })

  it("renders children when unauthenticated and not loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false })

    render(
      <PublicLayout>
        <p>child content</p>
      </PublicLayout>
    )

    expect(screen.getByText("child content")).toBeInTheDocument()
    expect(screen.queryByTestId("page-loader")).not.toBeInTheDocument()
  })

  it("redirects to /heists when the user is authenticated", async () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })

    render(
      <PublicLayout>
        <p>child content</p>
      </PublicLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/heists")
    })
  })

  it("shows the loader and does not redirect while loading, even with a user", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: true })

    render(
      <PublicLayout>
        <p>child content</p>
      </PublicLayout>
    )

    expect(screen.getByTestId("page-loader")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
