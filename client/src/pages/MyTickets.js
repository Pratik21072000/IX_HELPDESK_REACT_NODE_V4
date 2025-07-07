import React, { useState, useEffect } from "react";
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
} from "../components/ui/dialog";
import Pagination from "../components/ui/pagination";
import { api } from "../lib/utils";
import { format } from "date-fns";
import { Ticket, Plus, Calendar, Building2, Edit3 } from "lucide-react";

const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL_STATUS");
  const [priorityFilter, setPriorityFilter] = useState("ALL_PRIORITY");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchAllTickets = async () => {
    try {
      // Fetch all tickets without pagination to enable client-side filtering
      const response = await api.get(`/api/tickets?myTickets=true&limit=1000`);
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

    if (statusFilter !== "ALL_STATUS") {
      filteredTickets = filteredTickets.filter(
        (ticket) => ticket.status === statusFilter,
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
    pagination.currentPage,
  ]);

  // Reset to first page when search or filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [searchTerm, statusFilter, priorityFilter]);

  // Fetch all tickets once on component mount
  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
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
        return "bg-blue-100 text-blue-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "ON_HOLD":
        return "bg-orange-100 text-orange-800";
      case "CLOSED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800";
      case "LOW":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Tickets</h1>
          <p className="text-gray-600">
            View and manage tickets you have created
          </p>
        </div>
        <Button asChild>
          <Link to="/create-ticket">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Link>
        </Button>
      </div>

      {/* Search input */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Search your tickets by subject or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="font-poppins"
        />
      </div>

      {/* Filter dropdowns */}
      <div className="flex gap-4 items-end">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="status-filter"
            className="text-sm font-medium font-poppins"
          >
            Status
          </Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger
              className="w-[180px] font-poppins"
              id="status-filter"
            >
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
          <Label
            htmlFor="priority-filter"
            className="text-sm font-medium font-poppins"
          >
            Priority
          </Label>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger
              className="w-[180px] font-poppins"
              id="priority-filter"
            >
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
        priorityFilter !== "ALL_PRIORITY" ? (
          <>
            {pagination.totalCount} ticket
            {pagination.totalCount !== 1 ? "s" : ""} found
          </>
        ) : (
          <>
            {pagination.totalCount} ticket
            {pagination.totalCount !== 1 ? "s" : ""} total
          </>
        )}
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ||
              statusFilter !== "ALL_STATUS" ||
              priorityFilter !== "ALL_PRIORITY"
                ? "No matching tickets found"
                : "No tickets found"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ||
              statusFilter !== "ALL_STATUS" ||
              priorityFilter !== "ALL_PRIORITY"
                ? "Try adjusting your search terms or filters to see more tickets."
                : "You haven't created any tickets yet."}
            </p>
            <Button asChild>
              <Link to="/create-ticket">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card
              key={ticket.id}
              className="hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer bg-white hover:bg-blue-50/30"
              onClick={() => handleTicketClick(ticket)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-base font-normal">
                      #{ticket.id} [{ticket.category} – {ticket.subcategory}]{" "}
                      {(() => {
                        let cleanSubject = ticket.subject;
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
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace("_", " ")}
                    </Badge>
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    {/* Edit icon for Open and Re-Open tickets */}
                    {(ticket.status === "OPEN" ||
                      ticket.status === "RE_OPEN") && (
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
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Building2 className="h-4 w-4" />
                      {ticket.department}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created:{" "}
                      {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination - show when there are multiple pages */}
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

      {/* Ticket Detail Modal */}
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
                  Ticket details and information
                </DialogDescription>
                <div className="flex items-center gap-4 mt-2">
                  <Badge className={getStatusColor(selectedTicket.status)}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                  <Badge className={getPriorityColor(selectedTicket.priority)}>
                    {selectedTicket.priority}
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
                          className={getPriorityColor(selectedTicket.priority)}
                        >
                          {selectedTicket.priority}
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
                          className={getStatusColor(selectedTicket.status)}
                        >
                          {selectedTicket.status.replace("_", " ")}
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

              <div className="flex justify-end gap-2 pt-4 border-t">
                {(selectedTicket.status === "OPEN" ||
                  selectedTicket.status === "RE_OPEN") && (
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyTickets;
