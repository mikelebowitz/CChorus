import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  const getThemeIcon = () => {
    return theme === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
  }

  const getThemeLabel = () => {
    return theme === "light" ? "Light" : "Dark"
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 group"
      title={`Current theme: ${getThemeLabel()}. Click to cycle through themes. Keyboard shortcut: Ctrl/Cmd + T`}
    >
      <div className="transition-transform duration-200 ease-in-out group-hover:scale-110">
        {getThemeIcon()}
      </div>
      <span className="sr-only">
        Toggle theme. Current: {getThemeLabel()}
      </span>
      <span className="hidden sm:inline-block">
        {getThemeLabel()}
      </span>
    </button>
  )
}