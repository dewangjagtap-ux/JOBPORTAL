import React from 'react'
import { Form } from 'react-bootstrap'
import { useTheme } from '../context/ThemeContext'

export default function DarkModeToggle() {
  const { dark, toggle } = useTheme()
  return (
    <Form.Check
      type="switch"
      id="dark-mode-toggle"
      label={dark ? 'Dark' : 'Light'}
      checked={dark}
      onChange={toggle}
      className="me-3"
    />
  )
}
