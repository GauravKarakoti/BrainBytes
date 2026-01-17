# Internationalization (i18n) Implementation Guide

## Overview
BrainBytes now supports multiple languages using `next-intl` library. Currently, English (en) and Spanish (es) are supported.

## File Structure

```
messages/
├── en.json           # English translations
└── es.json           # Spanish translations

lib/i18n/
└── setUserLocale.ts  # Server action to set user language preference

components/
└── LanguageSwitcher.tsx  # Language selector component

i18n.config.ts       # i18n configuration
middleware.ts        # i18n middleware configuration
```

## How It Works

### 1. Configuration (`i18n.config.ts`)
- Defines supported locales: `['en', 'es']`
- Sets default locale to `'en'`
- Loads translation JSON files based on the requested locale

### 2. Middleware (`middleware.ts`)
- Uses `next-intl` middleware to handle locale detection from URL
- Routes are prefixed with locale (e.g., `/en/learn`, `/es/learn`)
- Uses `localePrefix: 'as-needed'` to optimize URLs (default locale is not shown)

### 3. Translation Files (`messages/`)
Each language has a JSON file with nested translation keys:

```json
{
  "common": { ... },
  "navigation": { ... },
  "auth": { ... },
  "buttons": { ... },
  "user": { ... },
  "landing": { ... },
  "courses": { ... },
  "lessons": { ... },
  "shop": { ... },
  "forum": { ... },
  "quests": { ... },
  "errors": { ... }
}
```

### 4. Language Switcher (`LanguageSwitcher.tsx`)
A client component that allows users to switch languages. Uses the `setUserLocale` server action to persist preference.

## Usage in Components

### Client Components
```tsx
'use client'

import { useTranslations } from 'next-intl'

export function MyComponent() {
  const t = useTranslations()

  return <button>{t('buttons.saveChanges')}</button>
}
```

### Server Components
```tsx
import { getTranslations } from 'next-intl/server'

export default async function MyPage() {
  const t = await getTranslations()

  return <h1>{t('landing.masterProgramming')}</h1>
}
```

## Adding a New Language

1. Create a new JSON file in `messages/` (e.g., `messages/fr.json`)
2. Add the language code to the `locales` array in `i18n.config.ts`:
   ```ts
   export const locales = ['en', 'es', 'fr']
   ```
3. Add the language to the `LanguageSwitcher.tsx`:
   ```tsx
   const languages = [
     { code: 'en', label: 'English' },
     { code: 'es', label: 'Español' },
     { code: 'fr', label: 'Français' },
   ]
   ```

## Adding New Translation Keys

1. Add the key to all language files in `messages/`:
   ```json
   {
     "feature": {
       "newFeature": "New feature text"
     }
   }
   ```
2. Use in components with `t('feature.newFeature')`

## Translation Key Naming Conventions

- Use **dot notation** for nested keys: `section.subsection.key`
- Use **camelCase** for key names: `displayName`, `userProfile`
- Group related keys together under sections:
  - `common.*` - Universal strings (loading, error, cancel, etc.)
  - `navigation.*` - Menu and navigation items
  - `auth.*` - Authentication-related strings
  - `buttons.*` - Button labels
  - `user.*` - User profile and account strings
  - `landing.*` - Homepage content
  - `courses.*`, `lessons.*`, `shop.*`, `forum.*`, `quests.*` - Feature-specific strings
  - `errors.*` - Error messages

## URL Structure

- English (default): `/learn`, `/dashboard`
- Spanish: `/es/learn`, `/es/dashboard`
- English explicit: `/en/learn` (redirects to `/learn`)

## Best Practices

1. **Always use translation keys** instead of hardcoding strings
2. **Group related translations** under logical sections
3. **Keep placeholders consistent** across languages
4. **Test all languages** when adding new features
5. **Use the LanguageSwitcher component** in navigation/headers for easy access
6. **Add translations for all user-facing text**, including:
   - Button labels
   - Page titles and descriptions
   - Form labels and placeholders
   - Error and success messages
   - Tooltips and help text

## Current Components Using Translations

- `Hero.tsx` - Landing page hero section
- `Reasons.tsx` - Features section
- `SideMenuUserButton.tsx` - User profile menu
- `LanguageSwitcher.tsx` - Language selection

## Testing Translations

1. Switch languages using the LanguageSwitcher
2. Verify all UI text updates correctly
3. Check that locale is persisted in cookies
4. Test redirects for non-default locale URLs

## Future Enhancements

- Add more languages (French, German, Chinese, etc.)
- Implement translation management UI
- Add right-to-left (RTL) language support
- Create translation status dashboard
- Automate translation updates with external services
