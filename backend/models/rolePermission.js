import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import Role from "./role.js";
import Permission from "./permission.js";

const RolePermission = sequelize.define(
  "RolePermission",
  {
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Role,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    permissionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Permission,
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: false,
  }
);

export default RolePermission;
