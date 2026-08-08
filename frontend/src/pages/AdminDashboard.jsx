import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Building2,
  MessageSquare,
  Shield,
  Trash2,
  Search,
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock Data for UI Demonstration
  const stats = [
    { label: "Total Users", value: "1,245", increase: "+12%", icon: Users },
    { label: "Total Venues", value: "84", increase: "+5%", icon: Building2 },
    { label: "Total Inquiries", value: "432", increase: "+18%", icon: MessageSquare },
    { label: "Active Admins", value: "3", increase: "0%", icon: Shield },
  ];

  const mockUsers = [
    { id: 1, name: "Aman Kumar", email: "aman@example.com", role: "customer", status: "Active" },
    { id: 2, name: "Sarah Wedding Planners", email: "contact@sarahweddings.com", role: "organizer", status: "Active" },
    { id: 3, name: "John Doe", email: "john@example.com", role: "customer", status: "Suspended" },
  ];

  const mockVenues = [
    { id: 1, name: "Grand Ballroom Palace", organizer: "Sarah Weddings", reports: 0, status: "Active" },
    { id: 2, name: "Sunset Beach Resort", organizer: "Ocean Events", reports: 2, status: "Under Review" },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-6 rounded-[24px] border border-rose-100 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                <stat.icon className="text-rose-400" size={24} />
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                <TrendingUp size={14} />
                {stat.increase}
              </span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mt-4">{stat.value}</h3>
            <p className="text-slate-500 mt-1 font-medium">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[24px] border border-rose-100 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Recent Platform Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="text-slate-500" size={18} />
              </div>
              <div className="flex-1">
                <p className="text-slate-800 font-medium">New organizer registration</p>
                <p className="text-sm text-slate-500">Ocean Events just joined the platform.</p>
              </div>
              <span className="text-sm text-slate-400">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-[24px] border border-rose-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-rose-50 flex flex-wrap gap-4 items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900">User Management</h3>
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
          <Search className="text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-full md:w-64"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-rose-50">
              <th className="p-6 font-medium">Name</th>
              <th className="p-6 font-medium">Email</th>
              <th className="p-6 font-medium">Role</th>
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-semibold text-slate-900">{user.name}</td>
                <td className="p-6 text-slate-500">{user.email}</td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    user.role === 'organizer' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderVenues = () => (
    <div className="bg-white rounded-[24px] border border-rose-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-rose-50">
        <h3 className="text-xl font-bold text-slate-900">Venue Moderation</h3>
        <p className="text-slate-500 text-sm mt-1">Review and manage platform listings.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-sm border-b border-rose-50">
              <th className="p-6 font-medium">Venue Name</th>
              <th className="p-6 font-medium">Organizer</th>
              <th className="p-6 font-medium">Reports</th>
              <th className="p-6 font-medium">Status</th>
              <th className="p-6 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockVenues.map((venue) => (
              <tr key={venue.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-6 font-semibold text-slate-900">{venue.name}</td>
                <td className="p-6 text-slate-500">{venue.organizer}</td>
                <td className="p-6">
                  <span className={`font-semibold ${venue.reports > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                    {venue.reports}
                  </span>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    venue.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {venue.status}
                  </span>
                </td>
                <td className="p-6 text-right flex justify-end gap-2">
                  <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                    Review
                  </button>
                  <button className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Listing">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffaf9] text-slate-800 font-sans">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-[24px] border border-rose-100 shadow-sm sticky top-28">
            
            <div className="mb-6 px-4 pt-2">
              <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">Admin Panel</h2>
            </div>
            
            <nav className="flex flex-col gap-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "overview" 
                    ? "bg-rose-50 text-rose-500" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <LayoutDashboard size={20} />
                Overview
              </button>

              <button
                onClick={() => setActiveTab("users")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "users" 
                    ? "bg-rose-50 text-rose-500" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Users size={20} />
                User Management
              </button>

              <button
                onClick={() => setActiveTab("venues")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "venues" 
                    ? "bg-rose-50 text-rose-500" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Building2 size={20} />
                Venue Moderation
              </button>

              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "reviews" 
                    ? "bg-rose-50 text-rose-500" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MessageSquare size={20} />
                Reviews & Content
              </button>
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "users" && renderUsers()}
            {activeTab === "venues" && renderVenues()}
            {activeTab === "reviews" && (
              <div className="bg-white p-12 text-center rounded-[24px] border border-rose-100 shadow-sm">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="text-rose-300" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Review Moderation</h3>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  Manage user reviews, handle reported content, and maintain platform quality.
                </p>
                <button className="mt-6 px-6 py-2 bg-slate-100 text-slate-600 font-medium rounded-xl">
                  No reported reviews
                </button>
              </div>
            )}
          </motion.div>
        </main>

      </div>
    </div>
  );
}