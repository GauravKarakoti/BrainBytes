'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Globe } from 'lucide-react'
import { locales } from '@/i18n.config'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export function LanguageSwitcher() {
  const [locale, setLocale] = useState('en')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Get locale from cookie or localStorage
    const savedLocale = localStorage.getItem('locale') || 'en'
    setLocale(savedLocale)
  }, [])

  const onChangeLocale = (newLocale: string) => {
    localStorage.setItem('locale', newLocale)
    setLocale(newLocale)
    setIsOpen(false)
    // Trigger a page reload or emit an event to update translations
    window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }))
  }

  const currentLanguage = languages.find(lang => lang.code === locale)?.label || 'Language'

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline text-sm">{currentLanguage}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onChangeLocale(lang.code)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                locale === lang.code
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-secondary'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
