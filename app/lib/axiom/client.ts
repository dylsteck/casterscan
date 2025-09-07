'use client';

import axiomClient from '@/app/lib/axiom/axiom';
import { Logger, AxiomJSTransport, ConsoleTransport } from '@axiomhq/logging';
import { createUseLogger, createWebVitalsComponent } from '@axiomhq/react';
import { nextJsFormatters } from '@axiomhq/nextjs/client';

const isAxiomEnabled = process.env.NEXT_PUBLIC_AXIOM_TOKEN && process.env.NEXT_PUBLIC_AXIOM_DATASET;

export const logger = new Logger({
  transports: isAxiomEnabled ? [
    new AxiomJSTransport({ 
      axiom: axiomClient, 
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!
    }),
  ] : [new ConsoleTransport()],
  formatters: nextJsFormatters,
});

const useLogger = createUseLogger(logger);
const WebVitals = createWebVitalsComponent(logger);

export { useLogger, WebVitals };
