const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    department: {
      type: DataTypes.ENUM("ADMIN", "FINANCE", "HR"),
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "OPEN",
        "IN_PROGRESS",
        "ON_HOLD",
        "CANCELLED",
        "CLOSED",
      ),
      allowNull: false,
      defaultValue: "OPEN",
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    files: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue("files");
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue("files", JSON.stringify(value || []));
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    tableName: "tickets",
    timestamps: true,
  },
);

module.exports = Ticket;
