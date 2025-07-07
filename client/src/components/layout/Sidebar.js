import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { LayoutDashboard, Ticket, Plus, User, LogOut } from "lucide-react";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isEmployee = user && user.role === "EMPLOYEE";

  const menuItems = [
    ...(!isEmployee
      ? [
          {
            icon: LayoutDashboard,
            label: "Dashboard",
            path: "/dashboard",
          },
        ]
      : []),
    {
      icon: Ticket,
      label: "My Tickets",
      path: "/my-tickets",
    },
    {
      icon: Plus,
      label: "Create Ticket",
      path: "/create-ticket",
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
    },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-incub-blue-600">TicketFlow</h2>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="text-sm font-medium text-gray-900">{user?.name}</div>
        <div className="text-xs text-gray-500">{user?.role}</div>
        {user?.department && (
          <div className="text-xs text-gray-500">{user.department}</div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-incub-blue-100 text-incub-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-gray-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
