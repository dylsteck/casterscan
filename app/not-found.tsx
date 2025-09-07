import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-gray-600 max-w-md">
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      
      <Link 
        href="/" 
        className="px-6 py-3 bg-white text-black border border-black hover:bg-black hover:text-white transition-colors font-medium"
      >
        Go Home
      </Link>
    </div>
  );
}
