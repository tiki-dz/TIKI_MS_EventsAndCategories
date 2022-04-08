// const { SubCategory } = require('./SubCategory')

module.exports = (sequelize, DataTypes) => {
  const category = sequelize.define('Category', {
    idCategory: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    icon: {
      type: DataTypes.STRING(45),
      allowNull: false
    }
  }, {
    classMethods: {
      associate: function (models) {
        // category.belongsToMany(models.SubCategory, {
        //   through: 'SubCategory_has_Category'
        // })
      }
    }
  })
  // other.associate = (models) => {

  // };
  return category
}
