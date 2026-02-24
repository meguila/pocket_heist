import { generateCodename, ADJECTIVES, NOUNS, ROLES } from "@/lib/codename"

describe("generateCodename", () => {
  it("returns a PascalCase string composed of exactly three word segments", () => {
    const result = generateCodename()
    const segments = result.match(/[A-Z][a-z]+/g)
    expect(segments).not.toBeNull()
    expect(segments?.length).toBe(3)
  })

  it("picks words from the correct array for each position", () => {
    const result = generateCodename()
    const segments = result.match(/[A-Z][a-z]+/g) as string[]
    expect(ADJECTIVES).toContain(segments[0])
    expect(NOUNS).toContain(segments[1])
    expect(ROLES).toContain(segments[2])
  })

  it("has no words shared across the three arrays", () => {
    const total = ADJECTIVES.length + NOUNS.length + ROLES.length
    const unique = new Set([...ADJECTIVES, ...NOUNS, ...ROLES]).size
    expect(unique).toBe(total)
  })

  it("produces more than one unique result across multiple calls", () => {
    const results = new Set(Array.from({ length: 20 }, () => generateCodename()))
    expect(results.size).toBeGreaterThan(1)
  })
})
