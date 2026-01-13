// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <span className="text-5xl font-bold text-blue-600">404</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Page Not Found</h1>
          <p className="text-gray-600">
            Sorry, we couldn&apos;t find the page you&apos;re looking for.
          </p>
        </div>
        
        <div className="space-y-4">
          <a
            href="/"
            className="inline-block w-full rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            Go back home
          </a>
          
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/courses"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Courses
            </a>
            <a
              href="/dashboard"
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Dashboard
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}