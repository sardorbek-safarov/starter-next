import { requireAuth, getServerAuth } from '../../../shared/lib/auth-server';
import { DashboardClient } from './DashboardClient';

export default async function DashboardPage() {
  // This runs on the server and will redirect if not authenticated
  await requireAuth();

  // Get initial user data on server
  const { user } = await getServerAuth();

  return (
    <div className='min-h-screen bg-gray-50'>
      <DashboardClient initialUser={user} />
    </div>
  );
}
