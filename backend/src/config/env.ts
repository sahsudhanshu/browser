import { config } from 'dotenv';

// Load environment variables
config();

interface EnvConfig {
    MONGO_URI: string;
    PORT: number;
    NODE_ENV: string;
    JWT_SECRET: string;
    JWT_EXPIRE: string;
    CORS_ORIGIN: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    
    return value;
};

export const env: EnvConfig = {
    MONGO_URI: getEnvVariable('MONGO_URI'),
    PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
    NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
    JWT_SECRET: getEnvVariable('JWT_SECRET'),
    JWT_EXPIRE: getEnvVariable('JWT_EXPIRE', '7d'),
    CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:5123'),
};
