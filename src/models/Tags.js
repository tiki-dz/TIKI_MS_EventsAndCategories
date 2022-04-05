// eslint-disable-next-line no-unused-vars

module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define('Tag', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    }
  }, {
    classMethods: {
      associate: function (models) {
        tag.belongsToMany(models.Event, {
          through: 'event_has_tag'
        })
      }
    }
  })
  // other.associate = (models) => {

  // };

  return tag
}
