export const ADJECTIVES = [
  "Silent", "Swift", "Phantom", "Reckless", "Cunning",
  "Hollow", "Brazen", "Veiled", "Gilded", "Sly",
  "Midnight", "Crooked", "Furtive", "Daring", "Elusive",
  "Wicked", "Stealthy", "Crimson", "Iron", "Slick",
]

export const NOUNS = [
  "Fox", "Viper", "Wraith", "Ghost", "Raven",
  "Jackal", "Lynx", "Cobra", "Crow", "Wolf",
  "Panther", "Falcon", "Serpent", "Hound", "Hawk",
  "Mamba", "Coyote", "Osprey", "Ferret", "Kite",
]

export const ROLES = [
  "Rogue", "Broker", "Cipher", "Fixer", "Courier",
  "Grifter", "Lockpick", "Scout", "Lookout", "Cleaner",
  "Forger", "Handler", "Runner", "Vault", "Trigger",
  "Shade", "Switch", "Operator", "Knife", "Wrench",
]

export function generateCodename(): string {
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]
  return pick(ADJECTIVES) + pick(NOUNS) + pick(ROLES)
}
