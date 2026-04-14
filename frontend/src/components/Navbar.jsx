import { Link, useNavigate } from 'react-router-dom'
import { getUser, removeToken } from '../utils/auth.js'

function Navbar() {
  const navigate = useNavigate()
  const user = getUser()

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const getNavLinks = () => {
    if (!user) return []

    const commonLinks = [{ label: 'Browse Auctions', href: '/auctions' }]

    if (user.role === 'buyer') {
      return [...commonLinks, { label: 'Won Auctions', href: '/profile' }]
    }

    if (user.role === 'seller') {
      return [
        ...commonLinks,
        { label: 'Plant Management', href: '/my-plants' },
        { label: 'Auction Management', href: '/create-auction' },
      ]
    }

    if (user.role === 'admin') {
      return [
        { label: 'Manage Plants', href: '/admin/plants' },
        { label: 'Manage Auctions', href: '/admin/auctions' },
      ]
    }

    return commonLinks
  }

  const displayName = user?.displayName || user?.email || 'User'
  const navLinks = getNavLinks()

  return (
    <nav className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 px-6 py-3 backdrop-blur-md flex items-center gap-8">
      {/* Left: Logo */}
      <Link
        to="/"
        className="text-xl font-bold text-emerald-700 hover:text-emerald-800 transition-colors shrink-0"
      >
        LeafBid
      </Link>

      {/* Middle: Navigation Links - Centered */}
      <div className="hidden md:flex flex-1 items-center justify-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Right: User Info and Logout */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden sm:block">
          <p className="text-sm text-slate-600">{displayName}</p>
        </div>
        <Link
          to="/profile"
          className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
        >
          My Profile
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
