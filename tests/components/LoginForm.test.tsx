import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginForm from "@/components/LoginForm"

describe("LoginForm", () => {
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

  it("calls console.log with email and password on submit", async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Email"), "test@example.com")
    await user.type(screen.getByLabelText("Password"), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(spy).toHaveBeenCalledWith({ email: "test@example.com", password: "secret123" })
    spy.mockRestore()
  })

  it("renders a link to /signup", () => {
    render(<LoginForm />)
    const link = screen.getByRole("link", { name: /sign up/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/signup")
  })
})
