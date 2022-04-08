
module.exports = (sequelize, DataTypes) => {
  const subCategory = sequelize.define('SubCategory', {
    idSubCategory: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    icon: {
      type: DataTypes.STRING(45),
      allowNull: false
    }

  }, {
    timestamps: true,

    classMethods: {
      associate: function (models) {
        subCategory.belongsTo(models.Category)
        subCategory.belongsToMany(models.Event, {
          through: 'event_has_subCategory',
          timestamps: false
        })
      }
    }

  })
  // other.associate = (models) => {

  // };
  return subCategory
}
