import axiomClient from '@/app/lib/axiom/axiom';
import { Logger, AxiomJSTransport, ConsoleTransport } from '@axiomhq/logging';

const isServer = typeof window === 'undefined';
const isAxiomEnabled = process.env.NEXT_PUBLIC_AXIOM_TOKEN && process.env.NEXT_PUBLIC_AXIOM_DATASET;

export const logger = new Logger({
  transports: isAxiomEnabled ? [
    new AxiomJSTransport({ 
      axiom: axiomClient, 
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!
    }),
  ] : [new ConsoleTransport()],
});

export const withAxiom = isServer 
  ? (handler: any) => {
      const { createAxiomRouteHandler, nextJsFormatters } = require('@axiomhq/nextjs');
      const serverLogger = new Logger({
        transports: isAxiomEnabled ? [
          new AxiomJSTransport({ 
            axiom: axiomClient, 
            dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!
          }),
        ] : [new ConsoleTransport()],
        formatters: nextJsFormatters,
      });
      return createAxiomRouteHandler(serverLogger)(handler);
    }
  : (handler: any) => handler;
