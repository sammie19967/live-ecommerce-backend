import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';


dotenv.config();

// Initialize Sequelize (Database Connection)
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

// Test Connection
(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL Database!');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
    }
})();

export default sequelize;
