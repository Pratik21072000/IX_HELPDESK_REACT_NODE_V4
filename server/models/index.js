const User = require("./User");
const Ticket = require("./Ticket");

// Define associations
User.hasMany(Ticket, {
  foreignKey: "createdBy",
  as: "tickets",
  onDelete: "CASCADE",
});

Ticket.belongsTo(User, {
  foreignKey: "createdBy",
  as: "user",
});

module.exports = {
  User,
  Ticket,
};
