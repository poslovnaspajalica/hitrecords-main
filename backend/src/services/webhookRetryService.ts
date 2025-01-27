import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';

interface WebhookRetry {
  id: string;
  endpoint: string;
  payload: any;
  attempts: number;
  maxAttempts: number;
  nextRetry: Date;
  lastError?: string;
}

export class WebhookRetryService {
  private isRunning: boolean = false;
  private interval: number = 5 * 60 * 1000; // 5 minuta
  private maxAttempts: number = 5;
  private backoffMultiplier: number = 2;

  async start() {
    if (this.isRunning) return;
    this.isRunning = true;

    const processRetries = async () => {
      if (!this.isRunning) return;

      try {
        await this.processFailedWebhooks();
      } catch (error) {
        console.error('Error processing webhook retries:', error);
      }

      setTimeout(processRetries, this.interval);
    };

    processRetries();
  }

  stop() {
    this.isRunning = false;
  }

  async addRetry(endpoint: string, payload: any, error: Error) {
    const retry: WebhookRetry = {
      id: uuidv4(),
      endpoint,
      payload,
      attempts: 1,
      maxAttempts: this.maxAttempts,
      nextRetry: this.calculateNextRetry(1)
    };

    await pool.query(
      `INSERT INTO webhook_retries 
       (id, endpoint, payload, attempts, max_attempts, next_retry, last_error)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        retry.id,
        retry.endpoint,
        JSON.stringify(retry.payload),
        retry.attempts,
        retry.maxAttempts,
        retry.nextRetry,
        error.message
      ]
    );
  }

  private async processFailedWebhooks() {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get retries that are due
      const [retries]: any = await connection.query(
        `SELECT * FROM webhook_retries 
         WHERE next_retry <= NOW() 
           AND attempts < max_attempts`
      );

      for (const retry of retries) {
        try {
          // Attempt to send webhook
          const response = await fetch(retry.endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(retry.payload)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // If successful, remove retry record
          await connection.query(
            'DELETE FROM webhook_retries WHERE id = ?',
            [retry.id]
          );
        } catch (error) {
          // Update retry record
          const attempts = retry.attempts + 1;
          if (attempts >= retry.max_attempts) {
            // Max attempts reached, mark as failed
            await connection.query(
              'DELETE FROM webhook_retries WHERE id = ?',
              [retry.id]
            );

            // Log final failure
            console.error(
              `Webhook retry failed permanently after ${attempts} attempts:`,
              {
                id: retry.id,
                endpoint: retry.endpoint,
                error: error instanceof Error ? error.message : 'Unknown error'
              }
            );
          } else {
            // Schedule next retry
            await connection.query(
              `UPDATE webhook_retries 
               SET attempts = ?,
                   next_retry = ?,
                   last_error = ?
               WHERE id = ?`,
              [
                attempts,
                this.calculateNextRetry(attempts),
                error instanceof Error ? error.message : 'Unknown error',
                retry.id
              ]
            );
          }
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private calculateNextRetry(attempts: number): Date {
    const delay = Math.pow(this.backoffMultiplier, attempts - 1) * 5 * 60 * 1000; // 5min * backoff
    return new Date(Date.now() + delay);
  }

  private async sendWebhook(url: string, data: any, headers: any = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(data)
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error sending webhook:', error);
      return false;
    }
  }
}

export const webhookRetryService = new WebhookRetryService(); 