'use client';

import { AuthWrapper } from '@/features/auth/components/AuthWrapper';
import { useAuth } from '@/features/auth';
import { User } from '@/entities/user/model';
import { UserCard } from '@/entities/user/ui/UserCard';
import {
  useDashboardStats,
  useUserActivities,
} from '@/shared/hooks/useQueries';

interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface ActivitiesResponse {
  items: Activity[];
  total: number;
  page: number;
}

interface DashboardClientProps {
  initialUser: User | null;
}

export function DashboardClient({ initialUser }: DashboardClientProps) {
  const { user, logout } = useAuth();

  // Use TanStack Query hooks
  const {
    data: dashboardStats,
    isLoading: statsLoading,
    error: statsError,
  } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useUserActivities(
    1,
    5
  );

  // Use client user if available, fallback to server user
  const currentUser = user || initialUser;

  return (
    <AuthWrapper requireAuth>
      <div className='container mx-auto p-8'>
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex justify-between items-center mb-6'>
            <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
            <button
              onClick={logout}
              className='bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded'
            >
              Logout
            </button>
          </div>

          {currentUser && (
            <div className='mb-6'>
              <h2 className='text-lg font-semibold mb-4'>
                Welcome back, {currentUser.name}!
              </h2>
              <UserCard user={currentUser} />
            </div>
          )}

          {/* Dashboard Statistics */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4'>Dashboard Overview</h3>
            {statsLoading && (
              <div className='text-gray-500'>Loading statistics...</div>
            )}
            {statsError && (
              <div className='text-red-500'>Failed to load statistics</div>
            )}
            {dashboardStats && (
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <div className='bg-blue-50 p-4 rounded-lg'>
                  <h4 className='font-semibold text-blue-800'>Total Views</h4>
                  <p className='text-2xl font-bold text-blue-900'>
                    {dashboardStats.totalViews || '0'}
                  </p>
                </div>
                <div className='bg-green-50 p-4 rounded-lg'>
                  <h4 className='font-semibold text-green-800'>
                    Active Sessions
                  </h4>
                  <p className='text-2xl font-bold text-green-900'>
                    {dashboardStats.activeSessions || '0'}
                  </p>
                </div>
                <div className='bg-purple-50 p-4 rounded-lg'>
                  <h4 className='font-semibold text-purple-800'>
                    Total Projects
                  </h4>
                  <p className='text-2xl font-bold text-purple-900'>
                    {dashboardStats.totalProjects || '0'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4'>Recent Activities</h3>
            {activitiesLoading && (
              <div className='text-gray-500'>Loading activities...</div>
            )}
            {activities && (
              <div className='space-y-2'>
                {(activities as ActivitiesResponse)?.items?.map(
                  (activity: Activity) => (
                    <div key={activity.id} className='bg-gray-50 p-3 rounded'>
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>{activity.title}</span>
                        <span className='text-sm text-gray-500'>
                          {activity.date}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600'>
                        {activity.description}
                      </p>
                    </div>
                  )
                ) || <p className='text-gray-500'>No recent activities</p>}
              </div>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h3 className='font-semibold text-blue-800'>Analytics</h3>
              <p className='text-blue-600'>View detailed analytics</p>
            </div>
            <div className='bg-green-50 p-4 rounded-lg'>
              <h3 className='font-semibold text-green-800'>Reports</h3>
              <p className='text-green-600'>Generate and download reports</p>
            </div>
            <div className='bg-purple-50 p-4 rounded-lg'>
              <h3 className='font-semibold text-purple-800'>Settings</h3>
              <p className='text-purple-600'>Manage your preferences</p>
            </div>
          </div>
        </div>
      </div>
    </AuthWrapper>
  );
}
