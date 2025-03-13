import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./user.js";

const Color = sequelize.define("Color", {
  color_code: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  fabric_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  by_who: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

User.hasMany(Color, { foreignKey: "by_who" });
Color.belongsTo(User, { foreignKey: "by_who" });

export default Color;
