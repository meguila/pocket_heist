import { render, screen, waitFor } from "@testing-library/react"
import { vi, beforeEach, describe, it, expect } from "vitest"
import type { User } from "firebase/auth"
import { useUser } from "@/hooks/useUser"

vi.mock("@/hooks/useUser")
vi.mock("@/components/PageLoader", () => ({
  default: () => <div data-testid="page-loader" />,
}))
vi.mock("@/components/Navbar", () => ({
  default: () => <nav data-testid="navbar" />,
}))

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
}))

// import layout after mocks are set up
import DashboardLayout from "@/app/(dashboard)/layout"

const mockUser = { uid: "abc123", email: "test@example.com" } as User

beforeEach(() => {
  vi.clearAllMocks()
})

describe("DashboardLayout", () => {
  it("shows the loader while auth is resolving", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: true })

    render(
      <DashboardLayout>
        <p>child content</p>
      </DashboardLayout>
    )

    expect(screen.getByTestId("page-loader")).toBeInTheDocument()
    expect(screen.queryByText("child content")).not.toBeInTheDocument()
  })

  it("renders Navbar and children when authenticated", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser, isLoading: false })

    render(
      <DashboardLayout>
        <p>child content</p>
      </DashboardLayout>
    )

    expect(screen.getByTestId("navbar")).toBeInTheDocument()
    expect(screen.getByText("child content")).toBeInTheDocument()
    expect(screen.queryByTestId("page-loader")).not.toBeInTheDocument()
  })

  it("redirects to /login when unauthenticated", async () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false })

    render(
      <DashboardLayout>
        <p>child content</p>
      </DashboardLayout>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login")
    })
  })

  it("shows the loader and does not redirect while loading", () => {
    vi.mocked(useUser).mockReturnValue({ user: null, isLoading: true })

    render(
      <DashboardLayout>
        <p>child content</p>
      </DashboardLayout>
    )

    expect(screen.getByTestId("page-loader")).toBeInTheDocument()
    expect(mockPush).not.toHaveBeenCalled()
  })
})
