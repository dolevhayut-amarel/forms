import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-bold text-neutral-200 mb-4">404</div>
        <h1 className="text-xl font-semibold text-neutral-800 mb-2">
          Page not found
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
