import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import Pagination from "../components/ui/pagination";
import { api } from "../lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Settings,
  User,
  Building2,
  Calendar,
  CheckCircle2,
  Play,
  Edit3,
  Clock,
  Pause,
  XCircle,
} from "lucide-react";

const ManageTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdate, setStatusUpdate] = useState({
    status: "",
    comment: "",
  });
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchTickets = useCallback(
    async (page = pagination.currentPage) => {
      try {
        setLoading(true);
        const response = await api.get(`/api/tickets?page=${page}&limit=10`);
        setTickets(response.tickets);
        setPagination(response.pagination);
      } catch (error) {
        console.error("Failed to fetch tickets:", error);
      } finally {
        setLoading(false);
      }
    },
    [pagination.currentPage],
  );

  useEffect(() => {
    fetchTickets();
  }, [pagination.currentPage, fetchTickets]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.put(`/api/tickets/${ticketId}`, { status: newStatus });
      toast.success(`Ticket ${newStatus.toLowerCase().replace("_", " ")}`);
      fetchTickets();
    } catch (error) {
      toast.error("Failed to update ticket");
      console.error("Failed to update ticket:", error);
    }
  };

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

      // Refresh tickets
      fetchTickets();

      // Reset state and close dialog
      setSelectedTicket(null);
      setStatusUpdate({ status: "", comment: "" });
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to update ticket status");
      console.error("Failed to update ticket:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (ticket) => {
    setSelectedTicket(ticket);
    setStatusUpdate({ status: ticket.status, comment: "" });
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
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manage Tickets</h1>
        <p className="text-gray-600">Oversee and manage department tickets</p>
      </div>

      <div className="text-sm text-gray-500">
        {pagination.totalCount} ticket{pagination.totalCount !== 1 ? "s" : ""}{" "}
        total
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-gray-500">
              No tickets have been submitted to your department yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
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
                      </h3>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status.replace("_", " ")}
                      </Badge>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </div>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {ticket.description}
                    </p>

                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {ticket.user?.name} ({ticket.user?.username})
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {ticket.department}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(ticket.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Edit icon with status dropdown - hidden for closed/cancelled tickets */}
                      {!["CLOSED", "CANCELLED"].includes(ticket.status) && (
                        <Dialog
                          open={isDialogOpen}
                          onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (open) {
                              openStatusDialog(ticket);
                            } else {
                              setSelectedTicket(null);
                              setStatusUpdate({ status: "", comment: "" });
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Ticket Status</DialogTitle>
                              <DialogDescription>
                                Update the status and add optional comments for
                                ticket #{selectedTicket?.id}
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
                                        <CheckCircle2 className="h-4 w-4" />
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
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {ticket.status !== "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateTicketStatus(ticket.id, "IN_PROGRESS")
                          }
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Mark In Progress
                        </Button>
                      )}
                      {ticket.status !== "CLOSED" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            updateTicketStatus(ticket.id, "CLOSED")
                          }
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
  );
};

export default ManageTickets;
