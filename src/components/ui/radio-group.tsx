"use client"

import * as React from "react"
import { CircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

function RadioGroup({
  className,
  value,
  onValueChange,
  defaultValue,
  children,
  ...props
}: RadioGroupProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value || "")

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }

  const currentValue = value !== undefined ? value : internalValue

  return (
    <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div
        data-slot="radio-group"
        className={cn("grid gap-3", className)}
        role="radiogroup"
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'checked' | 'onChange'> {
  value: string
}

function RadioGroupItem({
  className,
  value,
  id,
  ...props
}: RadioGroupItemProps) {
  const { value: groupValue, onValueChange } = React.useContext(RadioGroupContext)
  const inputId = id || `radio-${value}`
  const checked = groupValue === value

  const handleChange = () => {
    onValueChange?.(value)
  }

  return (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="radio"
          id={inputId}
          value={value}
          checked={checked}
          onChange={handleChange}
          className="peer sr-only"
          {...props}
        />
        <label
          htmlFor={inputId}
          data-slot="radio-group-item"
          className={cn(
            "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer flex items-center justify-center",
            checked && "border-primary",
            className
          )}
        >
          {checked && (
            <CircleIcon className="fill-primary size-2" />
          )}
        </label>
      </div>
    </div>
  )
}

export { RadioGroup, RadioGroupItem }
