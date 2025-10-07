import app from './app';
import { env } from './config/env';
import { startReminderJob } from './jobs/reminder';

const port = env.port;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`MRMS backend running on port ${port}`);
  startReminderJob();
});
