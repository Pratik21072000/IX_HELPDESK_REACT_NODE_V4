const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING, // Changed to STRING to support sub-roles like "Senior HR Executive"
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING, // Changed to STRING to support multiple departments
      allowNull: true,
    },
    // New field to store multiple departments this user can handle
    managedDepartments: {
      type: DataTypes.TEXT, // JSON string of departments this user can handle
      allowNull: true,
    },
    isManager: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

module.exports = User;
