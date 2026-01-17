'use client'

import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  const onChangeLocale = (newLocale: string) => {
    // Create the new pathname by replacing the locale in the URL
    let newPathname = pathname
    
    // If the pathname starts with the current locale, replace it
    if (pathname.startsWith(`/${locale}`)) {
      newPathname = pathname.replace(`/${locale}`, newLocale === 'en' ? '' : `/${newLocale}`)
    } else if (locale !== 'en') {
      // Current is non-default locale without prefix (shouldn't happen, but handle it)
      newPathname = newLocale === 'en' ? pathname : `/${newLocale}${pathname}`
    } else {
      // Current is default locale (en) without prefix, add new locale
      newPathname = newLocale === 'en' ? pathname : `/${newLocale}${pathname}`
    }

    // Ensure pathname starts with /
    if (!newPathname.startsWith('/')) {
      newPathname = '/' + newPathname
    }

    window.location.href = newPathname
  }

  const currentLanguage = languages.find(lang => lang.code === locale)?.label || 'Language'

  return (
    <Popover>
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
