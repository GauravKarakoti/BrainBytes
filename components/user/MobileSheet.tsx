import type { PropsWithChildren } from 'react'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

type MobileSheetProps = {}

export function MobileSheet({ children }: PropsWithChildren<MobileSheetProps>) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-10 dark:hover:bg-black/10 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-11/12 max-w-xs p-0 overflow-y-auto"
        aria-describedby="mobile-menu-description"
      >
        <div id="mobile-menu-description" className="sr-only">Mobile navigation menu</div>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold">Menu</h2>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <X className="size-5" />
              </Button>
            </SheetClose>
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
