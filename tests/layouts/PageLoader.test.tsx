import { render, screen } from "@testing-library/react"
import PageLoader from "@/components/PageLoader"

describe("PageLoader", () => {
  it("renders a loading status element", () => {
    render(<PageLoader />)
    expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument()
  })

  it("renders without throwing", () => {
    expect(() => render(<PageLoader />)).not.toThrow()
  })
})
