
module.exports = (sequelize, DataTypes) => {
  const event = sequelize.define('Event', {
    idEvent: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING(45)
    },
    description: {
      allowNull: false,
      type: DataTypes.TEXT
    },
    organiser: {
      allowNull: false,
      type: DataTypes.STRING(45)
    },
    startDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    endDate: {
      allowNull: false,
      type: DataTypes.DATE
    },
    address: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    eventImage: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    ticketImage: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    outherImage: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    externalUrls: {
      allowNull: false,
      type: DataTypes.STRING(255)
    },
    ticketNb: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DOUBLE(11, 0)
    },
    justForWomen: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
    // DOUBLE(11,10)
  }, {
    classMethods: {
      associate: function (models) {
        event.belongsToMany(models.Tag, {
          through: 'event_has_tag'
        })
        event.belongsToMany(models.SubCategory, {
          through: 'event_has_subCategory'
        })
      }
    }
  })
  // other.associate = (models) => {

  // };
  return event
}
