import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import Pagination from "../components/ui/pagination";
import { api } from "../lib/utils";
import { toast } from "sonner";
import {
  Ticket,
  Clock,
  CheckCircle,
  Plus,
  Building2,
  Calendar,
  Edit3,
  Play,
  Pause,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    comment: "",
  });
  const [updating, setUpdating] = useState(false);
  const [allTickets, setAllTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL_STATUS");
  const [priorityFilter, setPriorityFilter] = useState("ALL_PRIORITY");
  const [activeStatusCard, setActiveStatusCard] = useState("TOTAL");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const fetchStats = async () => {
    try {
      const response = await api.get("/api/dashboard/stats");
      setStats(response.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchAllTickets = async () => {
    try {
      // Fetch all tickets without pagination to enable client-side filtering
      const response = await api.get(`/api/tickets?limit=1000`);
      setAllTickets(response.tickets || []);
    } catch (error) {
      console.error("Failed to fetch all tickets:", error);
    }
  };

  // Filter and paginate tickets - main logic
  useEffect(() => {
    if (!allTickets.length) {
      setTickets([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Client-side filtering
    let filteredTickets = allTickets;

    if (searchTerm) {
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ticket.description &&
            ticket.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())),
      );
    }

    // Apply status filter from dropdown or status cards
    let finalStatusFilter = statusFilter;
    if (activeStatusCard !== "TOTAL" && statusFilter === "ALL_STATUS") {
      finalStatusFilter = activeStatusCard;
    }

    if (finalStatusFilter !== "ALL_STATUS") {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.status === finalStatusFilter,
      );
    }

    if (priorityFilter !== "ALL_PRIORITY") {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.priority === priorityFilter,
      );
    }

    // Client-side pagination
    const itemsPerPage = 10;
    const totalFilteredCount = filteredTickets.length;
    const totalPages = Math.max(
      1,
      Math.ceil(totalFilteredCount / itemsPerPage),
    );

    // Ensure current page is within valid range
    const validPage = Math.max(1, Math.min(pagination.currentPage, totalPages));

    const startIndex = (validPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    setTickets(paginatedTickets);
    setPagination({
      currentPage: validPage,
      totalPages: totalPages,
      totalCount: totalFilteredCount,
      limit: itemsPerPage,
      hasNextPage: validPage < totalPages,
      hasPrevPage: validPage > 1,
    });

    setLoading(false);
  }, [
    allTickets,
    searchTerm,
    statusFilter,
    priorityFilter,
    activeStatusCard,
    pagination.currentPage,
  ]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, statusFilter, priorityFilter, activeStatusCard]);

  // Fetch all tickets once on component mount
  useEffect(() => {
    fetchAllTickets();
    fetchStats();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedTicket || !statusUpdate.status) return;

    setUpdating(true);
    try {
      const updateData = { status: statusUpdate.status };
      if (statusUpdate.comment.trim()) {
        updateData.comment = statusUpdate.comment.trim();
      }

      await api.put(`/api/tickets/${selectedTicket.id}`, updateData);
      toast.success(
        `Ticket status updated to ${statusUpdate.status.replace("_", " ")}`,
      );

      // Refresh dashboard data
      fetchAllTickets();
      fetchStats();

      // Reset state
      setSelectedTicket(null);
      setStatusUpdate({ status: "", comment: "" });
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Failed to update ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const openStatusDialog = (ticket) => {
    setSelectedTicket(ticket);
    setStatusUpdate({ status: ticket.status, comment: "" });
  };

  const handleStatusCardClick = (status) => {
    setActiveStatusCard(status);
    // Reset dropdown filter when using status cards
    if (status !== "TOTAL") {
      setStatusFilter("ALL_STATUS");
    }
  };

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTicket(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ON_HOLD":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "CLOSED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "OPEN":
        return "Open";
      case "IN_PROGRESS":
        return "In Progress";
      case "ON_HOLD":
        return "On Hold";
      case "CLOSED":
        return "Closed";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case "HIGH":
        return "High";
      case "MEDIUM":
        return "Medium";
      case "LOW":
        return "Low";
      default:
        return priority;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.name}! Here's your ticket overview.
          </p>
        </div>
        <Button asChild>
          <Link to="/create-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "TOTAL"
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("TOTAL")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "OPEN"
              ? "ring-2 ring-yellow-500 bg-yellow-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("OPEN")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.open || 0}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "IN_PROGRESS"
              ? "ring-2 ring-blue-500 bg-blue-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("IN_PROGRESS")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgress || 0}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "ON_HOLD"
              ? "ring-2 ring-purple-500 bg-purple-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("ON_HOLD")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Hold</CardTitle>
            <Pause className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.onHold || 0}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "CLOSED"
              ? "ring-2 ring-green-500 bg-green-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("CLOSED")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.closed || 0}</div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
            activeStatusCard === "CANCELLED"
              ? "ring-2 ring-red-500 bg-red-50"
              : "hover:bg-gray-50"
          }`}
          onClick={() => handleStatusCardClick("CANCELLED")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.cancelled || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="max-w-md">
          <Input
            type="text"
            placeholder="Search tickets by subject or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex gap-4 items-end">
          <div className="flex flex-col gap-2">
            <Label htmlFor="status-filter" className="text-sm font-medium">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" id="status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="priority-filter" className="text-sm font-medium">
              Priority
            </Label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]" id="priority-filter">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_PRIORITY">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {searchTerm ||
          statusFilter !== "ALL_STATUS" ||
          priorityFilter !== "ALL_PRIORITY" ||
          activeStatusCard !== "TOTAL" ? (
            <>
              {pagination.totalCount} ticket
              {pagination.totalCount !== 1 ? "s" : ""} found
              {activeStatusCard !== "TOTAL" && (
                <span className="ml-1 text-blue-600 font-medium">
                  ({getStatusLabel(activeStatusCard)} only)
                </span>
              )}
            </>
          ) : (
            <>
              {pagination.totalCount} ticket
              {pagination.totalCount !== 1 ? "s" : ""} total
            </>
          )}
        </div>
      </div>

      {/* Recent Tickets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tickets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Loading tickets...</div>
            </div>
          ) : tickets.length > 0 ? (
            <div className="space-y-6">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer hover:bg-blue-50/30 p-6"
                  onClick={() => handleTicketClick(ticket)}
                >
                  <div className="flex items-start justify-between">
                    {/* Left side - Title and Footer */}
                    <div className="flex-1 min-w-0">
                      {/* 1. Ticket Title Line */}
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          #{ticket.id}{" "}
                          {(ticket.category || ticket.subcategory) && (
                            <span className="text-gray-700">
                              [
                              {ticket.category && ticket.subcategory
                                ? `${ticket.category} – ${ticket.subcategory}`
                                : ticket.category || ticket.subcategory}
                              ]{" "}
                            </span>
                          )}
                          <span className="text-gray-900">
                            {(() => {
                              let subject = ticket.subject;
                              // Remove any existing category/subcategory patterns from subject
                              const categoryPattern = ticket.category
                                ? ticket.category.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    "\\$&",
                                  )
                                : "";
                              const subcategoryPattern = ticket.subcategory
                                ? ticket.subcategory.replace(
                                    /[.*+?^${}()|[\]\\]/g,
                                    "\\$&",
                                  )
                                : "";

                              if (categoryPattern && subcategoryPattern) {
                                // Remove patterns like "[Category – Subcategory]" or "Category – Subcategory"
                                const fullPattern = new RegExp(
                                  `\\[?${categoryPattern}\\s*[–-]\\s*${subcategoryPattern}\\]?\\s*`,
                                  "gi",
                                );
                                subject = subject
                                  .replace(fullPattern, "")
                                  .trim();
                              } else if (categoryPattern) {
                                const catPattern = new RegExp(
                                  `\\[?${categoryPattern}\\]?\\s*`,
                                  "gi",
                                );
                                subject = subject
                                  .replace(catPattern, "")
                                  .trim();
                              } else if (subcategoryPattern) {
                                const subPattern = new RegExp(
                                  `\\[?${subcategoryPattern}\\]?\\s*`,
                                  "gi",
                                );
                                subject = subject
                                  .replace(subPattern, "")
                                  .trim();
                              }

                              return subject;
                            })()}
                          </span>
                        </h3>
                      </div>

                      {/* 2. Footer Section - Horizontal Row */}
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span>{ticket.department}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>
                            {format(
                              new Date(ticket.createdAt),
                              "dd MMM yyyy, h:mm a",
                            )}
                          </span>
                        </div>
                        {/* Status Update Button - Only for managers */}
                        {user?.isManager && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openStatusDialog(ticket)}
                                className="ml-auto"
                              >
                                <Edit3 className="h-4 w-4 mr-1" />
                                Update
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Ticket Status</DialogTitle>
                                <DialogDescription>
                                  Update the status and add optional comments
                                  for ticket #{selectedTicket?.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="status">Status</Label>
                                  <Select
                                    value={statusUpdate.status}
                                    onValueChange={(value) =>
                                      setStatusUpdate((prev) => ({
                                        ...prev,
                                        status: value,
                                      }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="OPEN">
                                        <div className="flex items-center gap-2">
                                          <Clock className="h-4 w-4" />
                                          Open
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="IN_PROGRESS">
                                        <div className="flex items-center gap-2">
                                          <Play className="h-4 w-4" />
                                          In Progress
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="ON_HOLD">
                                        <div className="flex items-center gap-2">
                                          <Pause className="h-4 w-4" />
                                          On Hold
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="CLOSED">
                                        <div className="flex items-center gap-2">
                                          <CheckCircle className="h-4 w-4" />
                                          Closed
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="CANCELLED">
                                        <div className="flex items-center gap-2">
                                          <XCircle className="h-4 w-4" />
                                          Cancelled
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="comment">
                                    Comment (Optional)
                                  </Label>
                                  <Input
                                    id="comment"
                                    placeholder="Add a comment about this status change..."
                                    value={statusUpdate.comment}
                                    onChange={(e) =>
                                      setStatusUpdate((prev) => ({
                                        ...prev,
                                        comment: e.target.value,
                                      }))
                                    }
                                  />
                                </div>

                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleStatusUpdate}
                                    disabled={updating || !statusUpdate.status}
                                  >
                                    {updating ? "Updating..." : "Update Status"}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedTicket(null);
                                      setStatusUpdate({
                                        status: "",
                                        comment: "",
                                      });
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>

                    {/* 3. Right side - Status, Priority, and Edit on same line */}
                    <div className="flex items-center gap-2 ml-4">
                      <Badge
                        className={`${getStatusColor(ticket.status)} border font-medium px-3 py-1`}
                      >
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge
                        className={`${getPriorityColor(ticket.priority)} border font-medium px-3 py-1`}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                      {/* Edit icon - hidden for closed/cancelled tickets */}
                      {!["CLOSED", "CANCELLED"].includes(ticket.status) && (
                        <Edit3
                          className="h-4 w-4 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/edit-ticket/${ticket.id}`);
                          }}
                          title="Edit Ticket"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalCount={pagination.totalCount}
                    limit={pagination.limit}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                {searchTerm ||
                statusFilter !== "ALL_STATUS" ||
                priorityFilter !== "ALL_PRIORITY" ||
                activeStatusCard !== "TOTAL"
                  ? "No matching tickets found"
                  : "No tickets found"}
              </div>
              {!(
                searchTerm ||
                statusFilter !== "ALL_STATUS" ||
                priorityFilter !== "ALL_PRIORITY" ||
                activeStatusCard !== "TOTAL"
              ) && (
                <Button asChild>
                  <Link to="/create-ticket">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Ticket
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Modal for Managers */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {selectedTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  #{selectedTicket.id} [{selectedTicket.category} –{" "}
                  {selectedTicket.subcategory}]{" "}
                  {(() => {
                    let cleanSubject = selectedTicket.subject;
                    // Remove any existing category/subcategory patterns from subject
                    const categoryPattern = selectedTicket.category
                      ? selectedTicket.category.replace(
                          /[.*+?^${}()|[\]\\]/g,
                          "\\$&",
                        )
                      : "";
                    const subcategoryPattern = selectedTicket.subcategory
                      ? selectedTicket.subcategory.replace(
                          /[.*+?^${}()|[\]\\]/g,
                          "\\$&",
                        )
                      : "";

                    if (categoryPattern && subcategoryPattern) {
                      const fullPattern = new RegExp(
                        `\\[?${categoryPattern}\\s*[–-]\\s*${subcategoryPattern}\\]?\\s*`,
                        "gi",
                      );
                      cleanSubject = cleanSubject
                        .replace(fullPattern, "")
                        .trim();
                    } else if (categoryPattern) {
                      const catPattern = new RegExp(
                        `\\[?${categoryPattern}\\]?\\s*`,
                        "gi",
                      );
                      cleanSubject = cleanSubject
                        .replace(catPattern, "")
                        .trim();
                    } else if (subcategoryPattern) {
                      const subPattern = new RegExp(
                        `\\[?${subcategoryPattern}\\]?\\s*`,
                        "gi",
                      );
                      cleanSubject = cleanSubject
                        .replace(subPattern, "")
                        .trim();
                    }

                    return cleanSubject;
                  })()}
                </DialogTitle>
                <DialogDescription>
                  View and manage ticket details
                </DialogDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    className={`${getStatusColor(selectedTicket.status)} border font-medium px-3 py-1`}
                  >
                    {getStatusLabel(selectedTicket.status)}
                  </Badge>
                  <Badge
                    className={`${getPriorityColor(selectedTicket.priority)} border font-medium px-3 py-1`}
                  >
                    {getPriorityLabel(selectedTicket.priority)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Created on{" "}
                    {format(
                      new Date(selectedTicket.createdAt),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </span>
                </div>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium border-b pb-2">
                    Ticket Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Department
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {selectedTicket.department}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Category
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {selectedTicket.category}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Subcategory
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {selectedTicket.subcategory}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Priority
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        <Badge
                          className={`${getPriorityColor(selectedTicket.priority)} border font-medium px-3 py-1`}
                        >
                          {getPriorityLabel(selectedTicket.priority)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium border-b pb-2">
                    Description
                  </h3>
                  <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                    {selectedTicket.description || "No description provided"}
                  </div>
                </div>

                {/* Comment */}
                {selectedTicket.comment && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium border-b pb-2">
                      Additional Comments
                    </h3>
                    <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                      {selectedTicket.comment}
                    </div>
                  </div>
                )}

                {/* Files */}
                {selectedTicket.files && selectedTicket.files.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium border-b pb-2">
                      Attached Files
                    </h3>
                    <div className="space-y-2">
                      {selectedTicket.files.map((file, index) => (
                        <div
                          key={file.id || index}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded border"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {file.name?.split(".").pop()?.toUpperCase() ||
                                "FILE"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {file.name || `File ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.size
                                ? `${(file.size / 1024).toFixed(1)} KB`
                                : "Size unknown"}
                              {file.uploadedAt &&
                                ` • Uploaded ${format(new Date(file.uploadedAt), "MMM d, yyyy")}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status and Timestamps */}
                <div className="space-y-2">
                  <h3 className="text-lg font-medium border-b pb-2">
                    Status & Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Current Status
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        <Badge
                          className={`${getStatusColor(selectedTicket.status)} border font-medium px-3 py-1`}
                        >
                          {getStatusLabel(selectedTicket.status)}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Last Updated
                      </Label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {format(
                          new Date(selectedTicket.updatedAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                {/* Manager Status Update Button */}
                {user?.isManager && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => openStatusDialog(selectedTicket)}
                        className="flex items-center gap-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        Update Status
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Ticket Status</DialogTitle>
                        <DialogDescription>
                          Update the status and add optional comments for ticket
                          #{selectedTicket?.id}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={statusUpdate.status}
                            onValueChange={(value) =>
                              setStatusUpdate((prev) => ({
                                ...prev,
                                status: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OPEN">Open</SelectItem>
                              <SelectItem value="IN_PROGRESS">
                                In Progress
                              </SelectItem>
                              <SelectItem value="ON_HOLD">On Hold</SelectItem>
                              <SelectItem value="CLOSED">Closed</SelectItem>
                              <SelectItem value="CANCELLED">
                                Cancelled
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comment">Comment (Optional)</Label>
                          <Input
                            id="comment"
                            placeholder="Add a comment about this status change..."
                            value={statusUpdate.comment}
                            onChange={(e) =>
                              setStatusUpdate((prev) => ({
                                ...prev,
                                comment: e.target.value,
                              }))
                            }
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={handleStatusUpdate}
                            disabled={updating || !statusUpdate.status}
                          >
                            {updating ? "Updating..." : "Update Status"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedTicket(null);
                              setStatusUpdate({
                                status: "",
                                comment: "",
                              });
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                <div className="flex gap-2">
                  {/* Edit Ticket Button (for editable tickets) */}
                  {!["CLOSED", "CANCELLED"].includes(selectedTicket.status) && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCloseModal();
                        navigate(`/edit-ticket/${selectedTicket.id}`);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Ticket
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleCloseModal}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
