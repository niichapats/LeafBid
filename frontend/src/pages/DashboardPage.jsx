import { Link, Navigate, useNavigate } from 'react-router-dom'
import { getUser, removeToken } from '../utils/auth.js'

function DashboardPage() {
  const navigate = useNavigate()
  const user = getUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  const menus = {
    seller: [
      { label: 'My Plants', to: '/my-plants' },
      { label: 'Create Auction', to: '/create-auction' },
      { label: 'Browse Auctions', to: '/auctions' },
    ],
    admin: [
      { label: 'Manage Plants', to: '/admin/plants' },
      { label: 'Manage Auctions', to: '/admin/auctions' },
    ],
    buyer: [{ label: 'Browse Auctions', to: '/auctions' }],
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-lime-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between rounded-3xl bg-white p-6 shadow-xl ring-1 ring-emerald-100">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">Signed in as {user.email} ({user.role})</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {(menus[user.role] || []).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-3xl bg-white p-6 shadow-lg ring-1 ring-emerald-100 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <h2 className="text-xl font-semibold text-emerald-900">{item.label}</h2>
              <p className="mt-2 text-sm text-gray-600">Open {item.label.toLowerCase()} section</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
