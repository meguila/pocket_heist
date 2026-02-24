import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import SignupForm from "@/components/SignupForm"

vi.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock("firebase/firestore", () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
}))

vi.mock("@/lib/firebase", () => ({
  auth: {},
  db: {},
}))

vi.mock("@/lib/codename", () => ({
  generateCodename: vi.fn(() => "SilentFoxRogue"),
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { setDoc } from "firebase/firestore"

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders email and password fields", () => {
    render(<SignupForm />)
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Password")).toBeInTheDocument()
  })

  it("renders a Sign Up submit button", () => {
    render(<SignupForm />)
    expect(screen.getByRole("button", { name: /^sign up$/i })).toBeInTheDocument()
  })

  it("masks the password field by default", () => {
    render(<SignupForm />)
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "password")
  })

  it("toggles password visibility when the toggle button is clicked", async () => {
    const user = userEvent.setup()
    render(<SignupForm />)

    const input = screen.getByLabelText("Password")
    expect(input).toHaveAttribute("type", "password")

    await user.click(screen.getByRole("button", { name: /show password/i }))
    expect(input).toHaveAttribute("type", "text")

    await user.click(screen.getByRole("button", { name: /hide password/i }))
    expect(input).toHaveAttribute("type", "password")
  })

  it("does not display an error on clean render", () => {
    render(<SignupForm />)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
  })

  it("disables the submit button and shows loading text while the request is in flight", async () => {
    const user = userEvent.setup()
    vi.mocked(createUserWithEmailAndPassword).mockReturnValue(new Promise(() => {}))
    render(<SignupForm />)

    await user.type(screen.getByLabelText("Email"), "new@example.com")
    await user.type(screen.getByLabelText("Password"), "password123")
    await user.click(screen.getByRole("button", { name: /^sign up$/i }))

    const btn = screen.getByRole("button", { name: /creating account/i })
    expect(btn).toBeDisabled()
  })

  it("displays an inline error when Firebase returns an auth error", async () => {
    const user = userEvent.setup()
    vi.mocked(createUserWithEmailAndPassword).mockRejectedValue({ code: "auth/email-already-in-use" })
    render(<SignupForm />)

    await user.type(screen.getByLabelText("Email"), "taken@example.com")
    await user.type(screen.getByLabelText("Password"), "password123")
    await user.click(screen.getByRole("button", { name: /^sign up$/i }))

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("An account with this email already exists.")
    })
  })

  it("renders a link to /login", () => {
    render(<SignupForm />)
    const link = screen.getByRole("link", { name: /log in/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/login")
  })
})
