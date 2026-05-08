import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "../components/ui/Button.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-brand-50">
      <div className="max-w-md text-center">
        <div className="mx-auto h-16 w-16 rounded-2xl bg-brand-100 grid place-items-center text-brand-700">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to="/dashboard" className="inline-block mt-6">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
