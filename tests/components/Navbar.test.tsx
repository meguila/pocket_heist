import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useUser } from "@/hooks/useUser"

// component imports
import Navbar from "@/components/Navbar"

vi.mock("@/hooks/useUser")
vi.mock("firebase/auth", () => ({ signOut: vi.fn() }))
vi.mock("@/lib/firebase", () => ({ auth: {} }))

const mockUser = { uid: "123", email: "test@test.com" }

beforeEach(() => {
  vi.mocked(useUser).mockReturnValue({ user: null, isLoading: false })
})

describe("Navbar", () => {
  it("renders the main heading", () => {
    render(<Navbar />)

    const heading = screen.getByRole("heading", { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it("renders the Create Heist link", () => {
    render(<Navbar />)

    const createLink = screen.getByRole("link", { name: /create heist/i })
    expect(createLink).toBeInTheDocument()
    expect(createLink).toHaveAttribute("href", "/heists/create")
  })

  it("shows the logout button when authenticated", () => {
    vi.mocked(useUser).mockReturnValue({ user: mockUser as never, isLoading: false })

    render(<Navbar />)

    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument()
  })

  it("hides the logout button when unauthenticated", () => {
    render(<Navbar />)

    expect(screen.queryByRole("button", { name: /logout/i })).not.toBeInTheDocument()
  })

  it("calls signOut when the logout button is clicked", async () => {
    const { signOut } = await import("firebase/auth")
    vi.mocked(useUser).mockReturnValue({ user: mockUser as never, isLoading: false })

    render(<Navbar />)
    await userEvent.click(screen.getByRole("button", { name: /logout/i }))

    expect(signOut).toHaveBeenCalledOnce()
  })

  it("disables the logout button while signing out", async () => {
    const { signOut } = await import("firebase/auth")
    vi.mocked(signOut).mockReturnValue(new Promise(() => {}))
    vi.mocked(useUser).mockReturnValue({ user: mockUser as never, isLoading: false })

    render(<Navbar />)
    await userEvent.click(screen.getByRole("button", { name: /logout/i }))

    expect(screen.getByRole("button", { name: /logout/i })).toBeDisabled()
  })
})
