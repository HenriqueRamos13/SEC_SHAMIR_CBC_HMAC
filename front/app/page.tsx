import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-4">ElPAGADOR</h1>
        <p className="text-xl mb-8">Secure Multiparty Computation for Round Payments</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="inline-block px-6 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
