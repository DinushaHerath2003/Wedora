import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import net from 'net';

/**
 * Check if a port is available on the specified host.
 * Returns true if the port can be bound, false if it's in use or error occurs.
 */
async function isPortAvailable(port: number, host = '0.0.0.0'): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const tester = net.createServer()
      .once('error', (err: any) => {
        if (err?.code === 'EADDRINUSE') resolve(false);
        else resolve(false);
      })
      .once('listening', () => {
        tester.once('close', () => resolve(true)).close();
      })
      .listen(port, host);
  });
}

/**
 * Find the next available port starting from a given port.
 * Searches up to maxChecks ports ahead.
 * Returns the available port number, or -1 if none found.
 */
async function findAvailablePort(
  startPort: number,
  maxChecks = 50,
): Promise<number> {
  for (let p = startPort; p < startPort + maxChecks; p++) {
    // eslint-disable-next-line no-await-in-loop
    if (await isPortAvailable(p)) {
      return p;
    }
  }
  return -1;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const allowedHosts = new Set(['localhost', '127.0.0.1', '192.168.56.1']);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const { hostname } = new URL(origin);

        if (allowedHosts.has(hostname)) {
          callback(null, true);
          return;
        }
      } catch {
        // Fall through to deny the origin.
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
  });

  const desiredPort = Number(process.env.PORT ?? 3002);

  // Smart port handling: try desired port first, then auto-fallback
  let selectedPort = desiredPort;

  if (!(await isPortAvailable(desiredPort))) {
    console.log(`[Port] Port ${desiredPort} is busy. Searching for available port...`);

    const nextPort = await findAvailablePort(desiredPort + 1);

    if (nextPort > 0) {
      selectedPort = nextPort;
      console.log(
        `[Port] Port ${desiredPort} is busy. Switching to port ${selectedPort}.`,
      );
    } else {
      console.error(
        `[Port] Port ${desiredPort} is in use and no available port found in range ${desiredPort + 1}-${desiredPort + 50}.`,
      );
      console.error(
        '[Port] Suggestion: Stop the process using port 3002 or set PORT env to an available port.',
      );
      process.exit(1);
    }
  } else {
    console.log(`[Port] Server running on port ${selectedPort}`);
  }

  await app.listen(selectedPort);
}

bootstrap();
