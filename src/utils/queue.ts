import PQueue from 'p-queue';

// Add pause state management
let isPaused = false;

export const setQueuePaused = (paused: boolean) => {
  isPaused = paused;
};

// Configure queue for optimal performance with reduced concurrency and increased timeout
export const apiQueue = new PQueue({
  concurrency: 30, // Reduced from 60 to avoid overwhelming the API
  interval: 1000, // Time window in milliseconds
  intervalCap: 30, // Reduced from 60 to stay within rate limits
  timeout: 60000, // Increased timeout to 60 seconds
  throwOnTimeout: true
});

// Add event listeners for monitoring
apiQueue.on('active', () => {
  console.log(`Working on ${apiQueue.pending} pending tasks`);
});

apiQueue.on('idle', () => {
  console.log('Queue is idle');
});

apiQueue.on('error', error => {
  console.error('Queue error:', error);
});

// Add method to check if queue is paused
export const isQueuePaused = () => isPaused;