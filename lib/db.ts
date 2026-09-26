import mongoose, { type Connection } from "mongoose";

import { AppError } from "@/lib/errors";

let cachedConnection: Connection | null = null;

export async function connectDB(): Promise<Connection> {
  if (cachedConnection && cachedConnection.readyState === 1) {
    return cachedConnection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new AppError(
      "MONGODB_URI environment variable is not defined. Please add it to your .env file.",
      500,
      "DB_CONFIG_ERROR"
    );
  }

  try {
    const connection = await mongoose.connect(uri, {
      bufferCommands: false,
    });

    cachedConnection = connection.connection;

    return cachedConnection;
  } catch {
    throw new AppError(
      "Failed to connect to the database. Please check your MongoDB configuration.",
      500,
      "DB_CONNECTION_ERROR"
    );
  }
}

export async function disconnectDB(): Promise<void> {
  if (cachedConnection) {
    await mongoose.disconnect();
    cachedConnection = null;
  }
}

export function getDB(): Connection | null {
  return cachedConnection;
}
