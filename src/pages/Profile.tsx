import { User } from 'lucide-react';

export default function Profile() {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-semibold">Your Profile</h1>
      </div>
      <p className="text-gray-600">
        This is a placeholder. Detailed profile editing will be added later.
      </p>
    </div>
  );
}