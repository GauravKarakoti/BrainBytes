// app/components/user/SideMenuItem.tsx
'use client'
"use client";

import type { Route } from "next";
import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

type SideMenuItemProps = {
  label: string;
  icon: string;
  href: Route | string;
  hideLabel?: boolean;
  disabled?: boolean;
};

export function SideMenuItem({
  href,
  icon,
  label,
  hideLabel,
  disabled = false,
}: SideMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const commonClasses =
    "h-auto w-full justify-start py-2 sm:max-lg:w-auto sm:max-lg:px-2";
  const stateClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : isActive
    ? "border-b-2"
    : "text-foreground/85";

export function SideMenuItem({ href, icon, label, hideLabel }: SideMenuItemProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <li role="none">
      <Button
        variant={isActive ? 'active' : 'ghost'}
        className={`h-auto w-full justify-start py-2 sm:max-lg:w-auto sm:max-lg:px-2 ${isActive ? 'border-b-2' : 'text-foreground/85'}`}
        asChild
      >
        <NextLink 
          href={href as Route} 
          title={label}
          aria-label={label}
          aria-current={isActive ? 'page' : undefined}
          role="menuitem"
        >
          <span className="relative block size-10" aria-hidden="true">
  return (
    <li>
      {disabled ? (
        <Button
          variant="ghost"
          className={`${commonClasses} ${stateClasses}`}
          aria-disabled="true"
          tabIndex={-1}
        >
          <span className="relative block size-10">
            <NextImage
              className="object-cover"
              src={`/img/icons/${icon}.svg`}
              alt="" // Empty alt because we have aria-label on parent
              fill
            />
          </span>
          {!hideLabel ? (
            <span className="ml-5 truncate sm:max-lg:sr-only">{label}</span>
          ) : (
            <span className="sr-only">{label}</span>
          )}
        </NextLink>
      </Button>
    </li>
  )
}
          {!hideLabel && <span className="ml-5 truncate sm:max-lg:sr-only">{label}</span>}
        </Button>
      ) : (
        <Button
          variant={isActive ? "active" : "ghost"}
          className={`${commonClasses} ${stateClasses}`}
          asChild
        >
          <NextLink
            href={href as Route}
            title={label}
            {...(hideLabel && { "aria-label": label })}
          >
            <span className="relative block size-10">
              <NextImage
                className="object-cover"
                src={`/img/icons/${icon}.svg`}
                alt={`${label} icon`}
                fill
              />
            </span>
            {!hideLabel && (
              <span className="ml-5 truncate sm:max-lg:sr-only">{label}</span>
            )}
          </NextLink>
        </Button>
      )}
    </li>
  );
}
