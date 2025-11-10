// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\dashboard\Dashboard.jsx
import { useAuth } from '../../hooks/useAuth';
import {
  CheckCircle,
  Person,
  Email,
  AdminPanelSettings,
  Category
} from '@mui/icons-material';

const Dashboard = () => {
  const { user, isAdmin, getCategories } = useAuth();

  return (
    <div className="fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Person className="text-primary-600" style={{ fontSize: 32 }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Welcome Back!
              </h2>
              <p className="text-gray-600 text-sm">
                {user?.fullName || 'User'}
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Person className="text-gray-500" fontSize="small" />
              <div>
                <p className="text-xs text-gray-500">Username</p>
                <p className="text-sm font-medium">{user?.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <Email className="text-gray-500" fontSize="small" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-gray-700">
              <AdminPanelSettings className="text-gray-500" fontSize="small" />
              <div>
                <p className="text-xs text-gray-500">Role</p>
                <p className="text-sm font-medium">
                  {isAdmin() ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                      Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      User
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Access Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Category className="text-green-600" style={{ fontSize: 32 }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Your Access
              </h2>
              <p className="text-gray-600 text-sm">
                Category Permissions
              </p>
            </div>
          </div>

          {isAdmin() ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  You have access to all categories
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600 font-medium mb-3">
                Assigned Categories:
              </p>
              {getCategories().length > 0 ? (
                <div className="space-y-2">
                  {getCategories().map((cat) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <CheckCircle className="text-primary-600" fontSize="small" />
                      <span className="text-sm font-medium text-gray-700">
                        {cat.categoryName}
                      </span>
                      <div className="ml-auto flex gap-1">
                        {cat.canView && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                            View
                          </span>
                        )}
                        {cat.canEdit && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Edit
                          </span>
                        )}
                        {cat.canDelete && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            Delete
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No categories assigned yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Total Orders</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-2">Coming soon...</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Transactions</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-2">Coming soon...</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Pending</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-2">Coming soon...</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="text-sm font-medium opacity-90 mb-2">Completed</h3>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs opacity-75 mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;