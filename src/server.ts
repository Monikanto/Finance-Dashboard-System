import app from './app';
import { config } from './config';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   Finance Dashboard API                  ║
  ║   Running on http://localhost:${PORT}        ║
  ║   Environment: ${config.nodeEnv.padEnd(23)}║
  ╚══════════════════════════════════════════╝
  `);
});
