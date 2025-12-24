'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'

export default function DeleteAccountPage() {
  const { getToken } = useAuth()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm')
      return
    }

    try {
      setLoading(true)
      setError('')

      const token = await getToken()

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/account`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirm: 'DELETE' }),
        }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data?.message || 'Failed to delete account')
      }

      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-gray-900 p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-red-500">
          Delete Account
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          This action is <span className="text-red-400 font-semibold">permanent</span>.
          All monitors, alerts, and API keys will be deleted.
        </p>

        {success ? (
          <div className="mt-6 rounded-lg bg-green-500/10 p-4 text-green-400">
            Account deleted successfully.
          </div>
        ) : (
          <>
            <div className="mt-6">
              <label className="block text-sm text-gray-300 mb-2">
                Type <span className="font-bold text-red-400">DELETE</span> to confirm
              </label>

              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg bg-gray-800 border border-gray-700 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              onClick={handleDelete}
              disabled={loading}
              className="mt-6 w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete My Account'}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              You cannot undo this action
            </p>
          </>
        )}
      </div>
    </div>
  )
}
