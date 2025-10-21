export class ResourceMonitor {
  constructor() {
    this.imageGenQueue = [];
    this.maxConcurrent = 2;
    this.memoryLimit = 1000000000; // 1GB
    this.isProcessing = false;
  }

  async checkResources() {
    const stats = {
      cpuUsage: process.cpuUsage(),
      memoryUsage: process.memoryUsage(),
      queueLength: this.imageGenQueue.length
    };

    if (stats.memoryUsage.heapUsed > this.memoryLimit) {
      throw new Error('System memory limit reached');
    }

    if (this.imageGenQueue.length >= 10) {
      throw new Error('Queue limit reached');
    }

    return stats;
  }

  async queueImageGeneration(prompt) {
    await this.checkResources();
    
    return new Promise((resolve, reject) => {
      this.imageGenQueue.push({
        prompt,
        resolve,
        reject,
        timestamp: Date.now()
      });

      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.imageGenQueue.length > 0) {
      const task = this.imageGenQueue[0];
      
      // Skip if task is older than 5 minutes
      if (Date.now() - task.timestamp > 300000) {
        this.imageGenQueue.shift();
        task.reject(new Error('Task timeout'));
        continue;
      }

      try {
        await this.checkResources();
        // Process task...
        this.imageGenQueue.shift();
        task.resolve();
      } catch (error) {
        task.reject(error);
      }
    }

    this.isProcessing = false;
  }
}