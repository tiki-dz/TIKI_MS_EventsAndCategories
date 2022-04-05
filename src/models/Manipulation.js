
module.exports = (sequelize, DataTypes) => {
  const manipulation = sequelize.define('Manipulation', {
    idManipulation: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    idAdmin: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {
    classMethods: {
      associate: function (models) {
        manipulation.belongsTo(models.Event, {
        })
      }
    }
  })
  // other.associate = (models) => {

  // };
  return manipulation
}
