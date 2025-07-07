import React from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { format } from "date-fns";
import { Shield, Building2, Calendar } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "FINANCE":
        return "bg-green-100 text-green-800 border-green-200";
      case "HR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EMPLOYEE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "ADMIN":
        return "Admin Manager";
      case "FINANCE":
        return "Finance Manager";
      case "HR":
        return "HR Manager";
      case "EMPLOYEE":
        return "Employee";
      default:
        return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-gray-600">
          Manage your account information and settings
        </p>
      </div>

      {/* Profile Information Card */}
      <Card className="bg-white shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                value={user?.name || ""}
                readOnly
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Username (Email) */}
            <div className="space-y-2">
              <Label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Username (Email)
              </Label>
              <Input
                id="username"
                value={user?.username || ""}
                readOnly
                className="bg-gray-50 border-gray-200"
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Role</Label>
              <div className="flex items-center">
                <Badge
                  className={`${getRoleBadgeColor(user?.role)} font-medium px-3 py-1`}
                >
                  {getRoleDisplayName(user?.role)}
                </Badge>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label
                htmlFor="department"
                className="text-sm font-medium text-gray-700"
              >
                Department
              </Label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <Input
                  id="department"
                  value={user?.department || ""}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Account Created */}
            <div className="space-y-2">
              <Label
                htmlFor="accountCreated"
                className="text-sm font-medium text-gray-700"
              >
                Account Created
              </Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="accountCreated"
                  value={
                    user?.createdAt
                      ? format(new Date(user.createdAt), "MMMM do, yyyy")
                      : ""
                  }
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>

            {/* Last Updated */}
            <div className="space-y-2">
              <Label
                htmlFor="lastUpdated"
                className="text-sm font-medium text-gray-700"
              >
                Last Updated
              </Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <Input
                  id="lastUpdated"
                  value={
                    user?.updatedAt
                      ? format(new Date(user.updatedAt), "MMM d, yyyy, h:mm a")
                      : user?.createdAt
                        ? format(
                            new Date(user.createdAt),
                            "MMM d, yyyy, h:mm a",
                          )
                        : ""
                  }
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
