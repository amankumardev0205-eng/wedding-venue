import { FaUsers, FaStore, FaEnvelope, FaStar, FaCheckCircle } from 'react-icons/fa';

export default function AdminAnalytics({ analytics, isLoading, onRefresh }) {
  if (isLoading || !analytics) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-lg ${color}`}>
          <Icon className="text-white" size={24} />
        </div>
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Platform Overview</h2>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Users Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaUsers className="text-blue-600" />
          Users
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={FaUsers}
            label="Total Users"
            value={analytics.users.total}
            color="bg-blue-500"
          />
          <StatCard
            icon={FaCheckCircle}
            label="Organizers"
            value={analytics.users.organizers}
            color="bg-green-500"
          />
          <StatCard
            icon={FaUsers}
            label="Customers"
            value={analytics.users.customers}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Venues Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaStore className="text-green-600" />
          Venues
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            icon={FaStore}
            label="Total Venues"
            value={analytics.venues.total}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Inquiries Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaEnvelope className="text-orange-600" />
          Inquiries
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={FaEnvelope}
            label="Total Inquiries"
            value={analytics.inquiries.total}
            color="bg-orange-500"
          />
          <StatCard
            icon={FaCheckCircle}
            label="Accepted"
            value={analytics.inquiries.accepted}
            color="bg-green-500"
          />
          <StatCard
            icon={FaEnvelope}
            label="Pending"
            value={analytics.inquiries.pending}
            color="bg-yellow-500"
          />
          <StatCard
            icon={FaEnvelope}
            label="Rejected"
            value={analytics.inquiries.rejected}
            color="bg-red-500"
          />
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaStar className="text-yellow-600" />
          Reviews
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={FaStar}
            label="Total Reviews"
            value={analytics.reviews.total}
            color="bg-yellow-500"
          />
          <StatCard
            icon={FaCheckCircle}
            label="Verified Reviews"
            value={analytics.reviews.verified}
            color="bg-green-500"
          />
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-lg bg-yellow-500">
                <FaStar className="text-white" size={24} />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Average Rating</p>
                <p className="text-3xl font-bold">
                  {analytics.reviews.averageRating.toFixed(1)}/5
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
