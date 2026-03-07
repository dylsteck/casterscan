// Dynamic import breaks circular deps that cause "module not instantiated" on Vercel/Bun.
// Export a fetch wrapper so the entry module stays minimal and app loads on first request.
let appPromise: Promise<{ app: { handle: (req: Request) => Promise<Response> } }> | null = null;

async function getApp() {
  if (!appPromise) appPromise = import("./app");
  const mod = await appPromise;
  return mod.app;
}

export default {
  async fetch(request: Request) {
    const app = await getApp();
    return app.handle(request);
  },
};
