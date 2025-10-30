import type { ComponentType } from 'react'

import {
  PawPrint,
  Gauge,
  CalendarCheck,
  UsersThree,
  IdentificationBadge,
  ShoppingBag,
  Archive,
  CurrencyCircleDollar,
  ChartLineUp,
  GearSix,
} from '@phosphor-icons/react'

import { cn } from '@/lib/utils'

type View =
  | 'dashboard'
  | 'appointments'
  | 'customers'
  | 'staff'
  | 'pos'
  | 'inventory'
  | 'finances'
  | 'reports'
  | 'settings'
  | 'new-appointment'
  | 'add-pet'
  | 'edit-pet'
  | 'customize-dashboard'
  | 'appointment-detail'
  | 'appointment-checkout'

interface NavigationProps {
  currentView: View
  onNavigate: (view: View) => void
  isCompact?: boolean
}

export function Navigation({ currentView, onNavigate, isCompact = false }: NavigationProps) {
  const navItems: Array<{
    id: View
    label: string
    description: string
    icon: ComponentType<{ size?: number; weight?: 'bold' | 'duotone' | 'fill' | 'light' | 'regular' | 'thin' }>
  }> = [
    { id: 'dashboard', label: 'Overview', description: 'Daily health check', icon: Gauge },
    { id: 'appointments', label: 'Schedule', description: 'Bookings & calendar', icon: CalendarCheck },
    { id: 'customers', label: 'Clients', description: 'Families & pets', icon: UsersThree },
    { id: 'staff', label: 'Team', description: 'Schedules & workload', icon: IdentificationBadge },
    { id: 'pos', label: 'Point of Sale', description: 'Quick checkout', icon: ShoppingBag },
    { id: 'inventory', label: 'Inventory', description: 'Supplies & stock', icon: Archive },
    { id: 'finances', label: 'Finances', description: 'Revenue snapshot', icon: CurrencyCircleDollar },
    { id: 'reports', label: 'Reports', description: 'Performance trends', icon: ChartLineUp },
    { id: 'settings', label: 'Settings', description: 'Preferences & tools', icon: GearSix },
  ]

  const navButtonPadding = isCompact ? 'py-2.5' : 'py-3'

  return (
    <>
      <aside className="hidden border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)]/95 backdrop-blur-sm lg:flex lg:w-72 lg:flex-col xl:w-80">
        <div className="flex h-24 items-center gap-3 border-b border-[var(--sidebar-border)] px-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[rgba(59,109,99,0.28)]">
            <PawPrint size={26} weight="fill" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--sidebar-muted)]">
              Scruffy Butts
            </span>
            <span className="text-xl font-semibold leading-tight text-[var(--sidebar-foreground)]">
              Operations Hub
            </span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <p className="px-4 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--sidebar-muted)]">Navigate</p>
          <ul className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={cn(
                      'group relative w-full rounded-xl border border-transparent px-4 text-left transition-all duration-200',
                      navButtonPadding,
                      isActive
                        ? 'bg-[var(--sidebar-active)] text-[var(--sidebar-foreground)] shadow-sm'
                        : 'text-[var(--sidebar-muted)] hover:bg-white/65 hover:text-[var(--sidebar-foreground)]'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex size-9 items-center justify-center rounded-lg border text-[var(--sidebar-muted)] transition-colors duration-200',
                          isActive
                            ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-[rgba(59,109,99,0.25)]'
                            : 'border-transparent bg-white/70 group-hover:text-[var(--sidebar-foreground)]'
                        )}
                      >
                        <Icon size={20} weight={isActive ? 'fill' : 'regular'} />
                      </span>
                      <span className="flex flex-col">
                        <span className="text-sm font-semibold tracking-wide">{item.label}</span>
                        <span className="text-xs font-medium text-[var(--sidebar-muted)]">
                          {item.description}
                        </span>
                      </span>
                    </span>
                    {isActive && (
                      <span className="absolute -left-2 top-1/2 h-10 w-1 -translate-y-1/2 rounded-full bg-[var(--primary)]" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="mt-10 rounded-2xl border border-[var(--sidebar-border)] bg-white/60 p-5 text-[var(--sidebar-foreground)] shadow-[0_16px_40px_-32px_rgba(43,38,29,0.45)]">
            <h3 className="text-sm font-semibold">Today&apos;s mission</h3>
            <p className="mt-1 text-sm text-[var(--sidebar-muted)]">
              Confirm grooming pickups, review supply levels, and keep the team in sync.
            </p>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-40 border-b border-[var(--sidebar-border)] bg-[var(--background)]/95 px-4 pb-3 pt-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md shadow-[rgba(59,109,99,0.3)]">
              <PawPrint size={24} weight="fill" />
            </div>
            <div>
              <p className="text-base font-semibold leading-tight text-[var(--sidebar-foreground)]">Operations Hub</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--sidebar-muted)]">Scruffy Butts</p>
            </div>
          </div>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors duration-200',
                  isActive
                    ? 'border-transparent bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm shadow-[rgba(59,109,99,0.25)]'
                    : 'border-[var(--sidebar-border)] bg-white/75 text-[var(--sidebar-foreground)]/80 hover:bg-white hover:text-[var(--sidebar-foreground)]'
                )}
              >
                <Icon size={16} weight={isActive ? 'fill' : 'regular'} />
                {item.label}
              </button>
            )
          })}
        </div>
      </header>
    </>
  )
}
