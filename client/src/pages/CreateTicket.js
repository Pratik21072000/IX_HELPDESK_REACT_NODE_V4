import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import FileUpload from "../components/ui/file-upload";
import { api, DEPARTMENT_STRUCTURE } from "../lib/utils";
import { toast } from "sonner";
import { Plus, X, Upload } from "lucide-react";

// Helper function to check if user is a manager (HR, Finance, Admin)
const isUserManager = (user) => {
  if (!user) return false;

  // Check isManager property
  if (user.isManager === true) return true;

  // Check role for manager keywords
  const role = user.role?.toUpperCase() || "";
  const roleKeywords = ["MANAGER", "ADMIN", "HR", "FINANCE", "EXECUTIVE"];
  if (roleKeywords.some((keyword) => role.includes(keyword))) return true;

  // Check department
  const managerDepartments = ["HR", "Finance", "ADMIN"];
  if (managerDepartments.includes(user.department)) return true;

  return false;
};

const CreateTicket = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    department: "",
    priority: "MEDIUM",
    category: "",
    subcategory: "",
    comment: "",
    status: "OPEN", // Default status for new tickets
  });
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ticketData = {
        ...formData,
        files: uploadedFiles,
      };

      await api.post("/api/tickets", ticketData);
      toast.success("Ticket created successfully!");
      navigate("/my-tickets");
    } catch (error) {
      toast.error("Failed to create ticket");
      console.error("Failed to create ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Reset category and subcategory when department changes
      if (field === "department") {
        newData.category = "";
        newData.subcategory = "";
      } else if (field === "category") {
        newData.subcategory = "";
      }

      return newData;
    });
  };

  const categories = formData.department
    ? Object.keys(DEPARTMENT_STRUCTURE[formData.department] || {})
    : [];

  const subcategories =
    formData.category && formData.department
      ? DEPARTMENT_STRUCTURE[formData.department][formData.category] || []
      : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Ticket
          </h1>
          <p className="text-gray-600 mt-2">
            Submit a request to get help with your inquiry
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Ticket Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full-width fields */}
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={handleInputChange("subject")}
                  placeholder="Brief description of the issue"
                  required
                  className="w-full"
                />
              </div>

              {/* Description */}
              <div>
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  placeholder="Detailed description of the issue"
                  rows={4}
                  required
                  className="w-full resize-none"
                />
              </div>
            </div>

            {/* Two-column grid for dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Priority */}
              <div>
                <Label
                  htmlFor="priority"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={handleInputChange("priority")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div>
                <Label
                  htmlFor="department"
                  className="text-sm font-medium text-gray-700 mb-1.5 block"
                >
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={handleInputChange("department")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="FINANCE">Finance</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category - Shows only after Department is selected */}
              {formData.department && (
                <div className="animate-in slide-in-from-top duration-300">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleInputChange("category")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subcategory - Shows only after Category is selected */}
              {formData.category && formData.department && (
                <div className="animate-in slide-in-from-top duration-300">
                  <Label
                    htmlFor="subcategory"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Subcategory
                  </Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={handleInputChange("subcategory")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Status - Only visible for managers (HR, Finance, Admin) */}
              {user?.role === "EMPLOYEE" && (
                <div className="animate-in slide-in-from-top duration-300">
                  <Label
                    htmlFor="status"
                    className="text-sm font-medium text-gray-700 mb-1.5 block"
                  >
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleInputChange("status")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="ON_HOLD">On Hold</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* File Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                Upload Files
              </Label>
              <FileUpload
                value={uploadedFiles}
                onChange={setUploadedFiles}
                maxFiles={5}
                maxSizeMB={10}
                disabled={loading}
              />
            </div>

            {/* Comment Field */}
            <div>
              <Label
                htmlFor="comment"
                className="text-sm font-medium text-gray-700 mb-1.5 block"
              >
                Comment <span className="text-gray-400">(Optional)</span>
              </Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={handleInputChange("comment")}
                placeholder="Add any additional comments or notes..."
                rows={3}
                className="w-full resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button type="submit" disabled={loading} className="px-6">
                {loading ? (
                  "Creating..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/my-tickets")}
                className="px-6"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
