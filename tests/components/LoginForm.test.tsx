import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import LoginForm from "@/components/LoginForm"

vi.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
}))

import { signInWithEmailAndPassword } from "firebase/auth"

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email and password fields", () => {
    render(<LoginForm />)
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })

  it("renders a Login submit button", () => {
    render(<LoginForm />)
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument()
  })

  it("masks the password field by default", () => {
    render(<LoginForm />)
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
  })

  it("toggles password visibility when the toggle button is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: /show password/i }))
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: /hide password/i }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("does not display an error on clean render", () => {
    render(<LoginForm />)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("disables the submit button and shows loading text while the request is in flight", async () => {
    const user = userEvent.setup()
    vi.mocked(signInWithEmailAndPassword).mockReturnValue(new Promise(() => {}))
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    const btn = screen.getByRole("button", { name: /logging in/i })
    expect(btn).toBeDisabled()
  })

  it("shows the success message when signInWithEmailAndPassword resolves", async () => {
    const user = userEvent.setup()
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as never)
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent("You're logged in!")
    })
  })

  it("shows an inline error when Firebase rejects with invalid credentials", async () => {
    const user = userEvent.setup()
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({ code: "auth/invalid-credential" })
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password.")
    })
  })

  it("shows a fallback error message for unexpected Firebase errors", async () => {
    const user = userEvent.setup()
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue({})
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong. Please try again.")
    })
  })

  it("renders a link to /signup", () => {
    render(<LoginForm />)
    const link = screen.getByRole("link", { name: /sign up/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/signup")
  })
})
