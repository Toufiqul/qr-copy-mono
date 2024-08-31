import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';

@Injectable()
export class RedisService {
  private client;

  constructor() {
    this.client = createClient(); // Defaults to localhost:6379
    this.client.connect().catch(console.error);
  }

  async addFileToList(key: string, fileName: string): Promise<void> {
    await this.client.rPush(key, fileName); // Add file name to a list associated with the key
  }

  async getFileList(key: string): Promise<string[]> {
    const fileList = await this.client.lRange(key, 0, -1); // Retrieve all file names
    return fileList;
  }

  async deleteFileList(key: string): Promise<void> {
    await this.client.del(key); // Delete the list associated with the key
  }
  // Create a new key-value pair in Redis with an array of filenames
  async createFileRecord(key: string, fileName: string): Promise<void> {
    // Check if key already exists
    const existingValue = await this.client.get(key);

    if (existingValue) {
      // If key exists, parse the array and add the new file name
      const fileArray = JSON.parse(existingValue);
      fileArray.push(fileName);
      await this.client.set(key, JSON.stringify(fileArray));
    } else {
      // If key doesn't exist, create a new array with the file name
      await this.client.set(key, JSON.stringify([fileName]));
    }
  }

  // Retrieve the file array stored under a specific key
  async getFileRecord(key: string): Promise<string[]> {
    const fileList = await this.client.get(key);
    return fileList ? JSON.parse(fileList) : [];
  }

  // Delete a key from Redis
  async deleteFileRecord(key: string): Promise<void> {
    await this.client.del(key);
  }
}
