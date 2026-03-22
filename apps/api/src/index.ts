import 'dotenv/config';
import app from './app';
import { seedIfEmpty } from './config/db';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

async function start(): Promise<void> {
  // Seed dev data before accepting traffic so the first request doesn't race
  await seedIfEmpty();

  app.listen(PORT, () => {
    console.log(`\n🦌 YoungBuck API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Press Ctrl+C to stop\n`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
