import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import User from './User.js';

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// A Product belongs to a Seller (User)
Product.belongsTo(User, { foreignKey: 'sellerId' });

export default Product;
