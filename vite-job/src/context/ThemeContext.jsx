import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // Force light mode only. Remove dark-mode option.
  const [dark] = useState(false)

  // Toggle is a no-op to keep components that call it safe.
  const toggle = () => {}

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
export default ThemeContext
