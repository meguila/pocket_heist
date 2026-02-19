import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SignupForm from "@/components/SignupForm"

describe("SignupForm", () => {
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

  it("calls console.log with email and password on submit", async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    render(<SignupForm />)

    await user.type(screen.getByLabelText("Email"), "new@example.com")
    await user.type(screen.getByLabelText("Password"), "newpass456")
    await user.click(screen.getByRole("button", { name: /^sign up$/i }))

    expect(spy).toHaveBeenCalledWith({ email: "new@example.com", password: "newpass456" })
    spy.mockRestore()
  })

  it("renders a link to /login", () => {
    render(<SignupForm />)
    const link = screen.getByRole("link", { name: /log in/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/login")
  })
})
