import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// API helper functions
export const api = {
  get: async (url) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error("API GET error:", error);
      throw error;
    }
  },

  post: async (url, data) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error("API POST error:", error);
      throw error;
    }
  },

  put: async (url, data) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText}`);
      }
      return response.json();
    } catch (error) {
      console.error("API PUT error:", error);
      throw error;
    }
  },
};

// Constants from the original types file
export const DEPARTMENT_STRUCTURE = {
  ADMIN: {
    "Office Facility": [
      "AC/Lighting Issues",
      "Desk Setup",
      "Cleanliness",
      "Power Outage",
      "Pest Control",
    ],
    "IT Assets": [
      "Laptop/Desktop Request",
      "Accessory Request",
      "Disposal Request",
    ],
    "ID Card & Access": [
      "ID Card Issue/Loss",
      "Door Access Request",
      "Visitor Pass",
      "Biometric Issue",
    ],
    "Travel & Transport": [
      "Cab Booking",
      "Travel Reimbursement",
      "Itinerary Change",
    ],
    "Stationery & Supplies": [
      "New Request",
      "Refill Request",
      "Printer Ink Request",
    ],
    Housekeeping: [
      "Cleaning Request",
      "Pantry Supplies",
      "Water Dispenser Issues",
    ],
    Maintenance: ["Furniture Repair", "Electrical Issue", "Plumbing"],
  },
  HR: {
    "Leave & Attendance": [
      "Leave Balance Query",
      "Attendance Correction",
      "Comp Off Request",
    ],
    "Employee Records": ["Document Request", "Name/Address Update"],
    Onboarding: ["Laptop Allocation", "Document Submission"],
    "Exit Process": ["Clearance", "Final Settlement"],
    "Policy & Compliance": ["Leave Policy", "Code of Conduct"],
    "Employee Benefits": ["Insurance", "Wellness Program"],
  },
  FINANCE: {
    Reimbursements: ["Travel", "Food", "WFH Setup"],
    "Payroll & Salary": [
      "Salary Discrepancy",
      "Payslip Request",
      "Tax Declaration Help",
      "PF Issues",
    ],
    "Vendor Payments": ["Invoice Submission", "PO Status"],
    Taxation: ["Form 16", "Investment Proof", "TDS Query"],
    "Accounts Payable": ["Payment Follow-up", "Bank Details Update"],
    "Accounts Receivable": ["Invoice Follow-up", "Receipt Confirmation"],
    "Procurement Support": ["PO Creation", "Software Request"],
  },
};
