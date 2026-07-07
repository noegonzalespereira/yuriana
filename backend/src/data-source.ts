import 'dotenv/config';
import { DataSource } from 'typeorm';

const host = process.env.DATABASE_HOST ?? 'localhost';
const esLocal = host === 'postgres' || host === 'localhost' || host === '127.0.0.1';

export default new DataSource({
  type: 'postgres',
  host,
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  ssl: esLocal ? false : { rejectUnauthorized: false },
});
