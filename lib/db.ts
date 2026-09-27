import mongoose, { type Connection } from "mongoose";

import { AppError } from "@/lib/errors";

let cachedConnection: Connection | null = null;
let pendingConnection: Promise<Connection> | null = null;

export async function connectDB(): Promise<Connection> {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  if (mongoose.connection.readyState === 1) {
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  if (pendingConnection) return pendingConnection;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new AppError(
      "MONGODB_URI environment variable is not defined. Please add it to your .env file.",
      500,
      "DB_CONFIG_ERROR"
    );
  }

  try {
    const connectionPromise = mongoose.connect(uri, {
      bufferCommands: false,
      maxPoolSize: 10,
    }).then((instance) => {
      cachedConnection = instance.connection;
      return cachedConnection;
    }).catch(() => {
      cachedConnection = null;
      throw new AppError(
        "Failed to connect to the database. Please check your MongoDB configuration.",
        500,
        "DB_CONNECTION_ERROR"
      );
    }).finally(() => {
      pendingConnection = null;
    });
    pendingConnection = connectionPromise;
    return connectionPromise;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "Failed to connect to the database. Please check your MongoDB configuration.",
      500,
      "DB_CONNECTION_ERROR"
    );
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  cachedConnection = null;
  pendingConnection = null;
}

export function getDB(): Connection | null {
  return cachedConnection ?? (mongoose.connection.readyState === 1 ? mongoose.connection : null);
}
