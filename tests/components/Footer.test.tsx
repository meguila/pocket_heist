import { render, screen } from "@testing-library/react"
import Footer from "@/components/Footer"

describe("Footer", () => {
  it("renders without crashing", () => {
    render(<Footer />)
    expect(screen.getByRole("contentinfo")).toBeInTheDocument()
  })

  it("displays the app name", () => {
    render(<Footer />)
    const matches = screen.getAllByText(/cket Heist/i)
    expect(matches.length).toBeGreaterThan(0)
  })

  it("renders the Heists link with correct href", () => {
    render(<Footer />)
    const link = screen.getByRole("link", { name: /^heists$/i })
    expect(link).toHaveAttribute("href", "/heists")
  })

  it("renders the Create Heist link with correct href", () => {
    render(<Footer />)
    const link = screen.getByRole("link", { name: /create heist/i })
    expect(link).toHaveAttribute("href", "/heists/create")
  })

  it("displays a copyright notice with the current year", () => {
    render(<Footer />)
    const year = new Date().getFullYear().toString()
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument()
  })
})
