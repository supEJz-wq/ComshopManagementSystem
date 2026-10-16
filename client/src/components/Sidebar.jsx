import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.js'

const navItems = [
  { to: '/', label: 'Home', adminOnly: false },
  { to: '/pcs', label: 'PCs', adminOnly: false },
  { to: '/rentals', label: 'Rentals', adminOnly: false },
  { to: '/payments', label: 'Payments', adminOnly: false },
  // Both roles. A Cashier reaches this and finds Today only, with no period
  // selector — the narrower view IS the permission (Decision 110).
  { to: '/revenue', label: 'Revenue', adminOnly: false },
  { to: '/analytics', label: 'Analytics', adminOnly: true },
  { to: '/accounts', label: 'Accounts', adminOnly: true },
]

const roleLabel = { admin: 'Admin / Owner', cashier: 'Cashier' }

function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      {/*
        The brand lives here rather than in a header eyebrow, where it was
        taking up the most valuable strip on the page to say nothing the
        cashier does not already know.
      */}
      <div className="border-b border-slate-100 px-4 py-4">
        <p className="font-data text-base leading-none font-semibold tracking-tight text-slate-900">
          CyberShopOS
        </p>
        <p className="mt-1 text-xs text-slate-500">{roleLabel[user?.role]}</p>
      </div>

      <nav className="flex flex-col gap-0.5 p-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              [
                'rounded-control px-3 py-2 text-sm',
                /*
                  Selection stays neutral on purpose. A state colour in this
                  app only ever means a machine state, so painting the
                  current page amber would make a cashier second-guess every
                  amber thing they see. Selection is carried by weight and
                  fill instead.
                */
                isActive
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-100 p-3">
        <p className="truncate px-1 text-sm font-medium text-slate-900">{user?.username}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 w-full rounded-control border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
