const bcrypt = require("bcryptjs");
const { sequelize } = require("./config/database");
const { User, Ticket } = require("./models");

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synchronized");

    // Create users
    const users = [
      {
        username: "admin",
        password: await bcrypt.hash("password", 10),
        name: "System Administrator",
        role: "ADMIN",
        department: "ADMIN",
        managedDepartments: JSON.stringify(["ADMIN", "FINANCE", "HR"]),
        isManager: true,
      },
      {
        username: "hr_manager",
        password: await bcrypt.hash("password", 10),
        name: "Senior HR Executive",
        role: "Senior HR Executive",
        department: "HR",
        managedDepartments: JSON.stringify(["HR", "FINANCE"]), // Handles both HR and Finance
        isManager: true,
      },
      {
        username: "finance_manager",
        password: await bcrypt.hash("password", 10),
        name: "Finance Manager",
        role: "Finance Manager",
        department: "FINANCE",
        managedDepartments: JSON.stringify(["FINANCE"]),
        isManager: true,
      },
      {
        username: "hr_junior",
        password: await bcrypt.hash("password", 10),
        name: "Junior HR Executive",
        role: "Junior HR Executive",
        department: "HR",
        managedDepartments: JSON.stringify(["HR"]),
        isManager: true,
      },
      {
        username: "john_doe",
        password: await bcrypt.hash("password", 10),
        name: "John Doe",
        role: "EMPLOYEE",
        department: null,
        managedDepartments: null,
        isManager: false,
      },
      {
        username: "jane_smith",
        password: await bcrypt.hash("password", 10),
        name: "Jane Smith",
        role: "EMPLOYEE",
        department: null,
        managedDepartments: null,
        isManager: false,
      },
    ];

    const createdUsers = await User.bulkCreate(users);
    console.log("Users created");

    // Create sample tickets
    const tickets = [
      {
        subject:
          "[Office Facility - AC/Lighting Issues] AC not working in Conference Room A",
        description:
          "The air conditioning system in Conference Room A has been malfunctioning since yesterday. The temperature is too high for meetings.",
        department: "ADMIN",
        priority: "HIGH",
        status: "OPEN",
        category: "Office Facility",
        subcategory: "AC/Lighting Issues",
        createdBy: createdUsers[3].id, // john_doe
      },
      {
        subject:
          "[Leave & Attendance - Leave Balance Query] Need clarification on leave balance",
        description:
          "I want to check my remaining annual leave balance and understand the policy for carry-forward leaves.",
        department: "HR",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        category: "Leave & Attendance",
        subcategory: "Leave Balance Query",
        createdBy: createdUsers[4].id, // jane_smith
      },
      {
        subject:
          "[Reimbursements - Travel] Travel expense reimbursement for client visit",
        description:
          "Need to submit travel expenses for the client visit to Mumbai last week. Total amount: ₹15,000",
        department: "FINANCE",
        priority: "MEDIUM",
        status: "OPEN",
        category: "Reimbursements",
        subcategory: "Travel",
        createdBy: createdUsers[3].id, // john_doe
      },
    ];

    await Ticket.bulkCreate(tickets);
    console.log("Tickets created");

    console.log("Database seeded successfully!");
    console.log("\nTest credentials:");
    console.log("Admin: admin / password");
    console.log("HR Manager: hr_manager / password");
    console.log("Finance Manager: finance_manager / password");
    console.log("Employee: john_doe / password");
    console.log("Employee: jane_smith / password");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
