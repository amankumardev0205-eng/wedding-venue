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
  TrendingUp,
  AlertTriangle
} from "lucide-react";

// UI components
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { Card, CardContent } from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";

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
      
      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border border-[var(--border-medium)] shadow-sm">
              <CardContent className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <stat.icon size={20} />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                    <TrendingUp size={11} />
                    <span>{stat.increase}</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold text-[var(--text-dark)] tracking-tight">{stat.value}</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-bold uppercase tracking-wider">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity Card */}
      <Card className="border border-[var(--border-medium)] shadow-sm">
        <CardContent className="p-6 md:p-8 flex flex-col gap-5">
          <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] border-b border-[var(--border-light)] pb-3 select-none">
            Recent Platform Activity
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-light)] hover:bg-stone-50 dark:hover:bg-stone-850/10 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-900/50 flex items-center justify-center text-[var(--text-muted)] shrink-0 select-none">
                  <Users size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[var(--text-dark)] truncate">New organizer registration</p>
                  <p className="text-xs text-[var(--text-muted)] font-semibold truncate mt-0.5">Ocean Events just joined the platform.</p>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold whitespace-nowrap shrink-0 select-none">2h ago</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );

  const renderUsers = () => (
    <Card className="border border-[var(--border-medium)] shadow-sm overflow-hidden">
      
      {/* Search Header */}
      <div className="p-6 border-b border-[var(--border-light)] flex flex-wrap gap-4 items-center justify-between bg-stone-50 dark:bg-stone-900/30">
        <h3 className="font-serif text-lg font-bold text-[var(--text-dark)] select-none">User Management</h3>
        <div className="w-full md:w-72 select-none">
          <Input 
            placeholder="Search users..." 
            leftIcon={<Search size={14} className="text-[var(--text-muted)]" />}
            aria-label="Search users list"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-stone-50 dark:bg-stone-900/40 select-none">
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Name</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Email</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Role</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockUsers.map((user) => (
              <tr key={user.id} className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors">
                <td className="px-6 py-4 font-bold text-[var(--text-dark)] select-text">{user.name}</td>
                <td className="px-6 py-4 text-[var(--text-muted)] font-semibold select-text">{user.email}</td>
                <td className="px-6 py-4 select-none">
                  <Badge variant={user.role === 'organizer' ? 'primary' : 'secondary'} className="capitalize text-[10px] font-bold py-0.5 px-2.5">
                    {user.role}
                  </Badge>
                </td>
                <td className="px-6 py-4 select-none">
                  <Badge variant={user.status === 'Active' ? 'success' : 'danger'} className="text-[10px] font-bold py-0.5 px-2.5">
                    {user.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right select-none">
                  <Button 
                    variant="ghost" 
                    size="xs"
                    className="text-red-600 hover:bg-red-50 p-1.5"
                    aria-label={`Delete ${user.name}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Card>
  );

  const renderVenues = () => (
    <Card className="border border-[var(--border-medium)] shadow-sm overflow-hidden">
      
      {/* Moderation Header */}
      <div className="p-6 border-b border-[var(--border-light)] bg-stone-50 dark:bg-stone-900/30 select-none">
        <h3 className="font-serif text-lg font-bold text-[var(--text-dark)]">Venue Moderation</h3>
        <p className="text-xs text-[var(--text-muted)] font-semibold mt-1">Review and manage platform listings.</p>
      </div>

      {/* Moderation table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--border-light)] bg-stone-50 dark:bg-stone-900/40 select-none">
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Venue Name</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Organizer</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Reports</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-bold text-[var(--text-muted)] uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockVenues.map((venue) => (
              <tr key={venue.id} className="border-b border-[var(--border-light)] hover:bg-stone-50/20 dark:hover:bg-stone-850/10 transition-colors">
                <td className="px-6 py-4 font-bold text-[var(--text-dark)] select-text">{venue.name}</td>
                <td className="px-6 py-4 text-[var(--text-muted)] font-semibold select-text">{venue.organizer}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold select-none text-xs ${venue.reports > 0 ? 'text-red-650 flex items-center gap-1.5' : 'text-[var(--text-muted)]'}`}>
                    {venue.reports > 0 && <AlertTriangle size={12} />}
                    <span>{venue.reports} reports</span>
                  </span>
                </td>
                <td className="px-6 py-4 select-none">
                  <Badge variant={venue.status === 'Active' ? 'success' : 'warning'} className="text-[10px] font-bold py-0.5 px-2.5">
                    {venue.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2 select-none">
                  <Button 
                    variant="outline" 
                    size="xs"
                    className="font-bold border-stone-200"
                  >
                    Review
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="xs"
                    className="text-red-600 hover:bg-red-50 p-1.5"
                    aria-label={`Delete venue listing ${venue.name}`}
                  >
                    <Trash2 size={15} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </Card>
  );

  return (
    <div className="min-h-screen text-[var(--text-body)] pt-8 pb-16 bg-[var(--bg-slate)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0 select-none">
          <Card className="border border-[var(--border-medium)] shadow-sm sticky top-28 bg-white dark:bg-stone-900/40">
            <CardContent className="p-5 flex flex-col gap-2">
              
              <div className="px-3 pt-1 pb-3 border-b border-[var(--border-light)] mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Admin Panel</span>
              </div>
              
              <nav className="flex flex-col gap-1.5">
                <Button
                  onClick={() => setActiveTab("overview")}
                  variant={activeTab === "overview" ? "primary" : "ghost"}
                  className="w-full justify-start gap-3 font-bold py-2.5 px-3.5"
                  leftIcon={<LayoutDashboard size={16} />}
                >
                  Overview
                </Button>

                <Button
                  onClick={() => setActiveTab("users")}
                  variant={activeTab === "users" ? "primary" : "ghost"}
                  className="w-full justify-start gap-3 font-bold py-2.5 px-3.5"
                  leftIcon={<Users size={16} />}
                >
                  User Management
                </Button>

                <Button
                  onClick={() => setActiveTab("venues")}
                  variant={activeTab === "venues" ? "primary" : "ghost"}
                  className="w-full justify-start gap-3 font-bold py-2.5 px-3.5"
                  leftIcon={<Building2 size={16} />}
                >
                  Venue Moderation
                </Button>

                <Button
                  onClick={() => setActiveTab("reviews")}
                  variant={activeTab === "reviews" ? "primary" : "ghost"}
                  className="w-full justify-start gap-3 font-bold py-2.5 px-3.5"
                  leftIcon={<MessageSquare size={16} />}
                >
                  Reviews & Content
                </Button>
              </nav>

            </CardContent>
          </Card>
        </aside>

        {/* Tab pane content container */}
        <main className="flex-1 min-w-0 w-full">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === "overview" && renderOverview()}
            {activeTab === "users" && renderUsers()}
            {activeTab === "venues" && renderVenues()}
            {activeTab === "reviews" && (
              <EmptyState
                title="Review Moderation"
                description="Manage user reviews, handle reported content alerts, and maintain venue discovery platform quality guidelines."
                action={
                  <Button 
                    variant="outline" 
                    className="font-bold border-stone-200"
                    disabled
                  >
                    No reported reviews
                  </Button>
                }
              />
            )}
          </motion.div>
        </main>

      </div>
    </div>
  );
}