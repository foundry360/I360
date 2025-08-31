import { onRequest } from "firebase-functions/v2/https";
import next from "next";

const isDev = process.env.NODE_ENV !== "production";
const nextjsDistDir = "../.next";

const nextjsServer = next({
  dev: isDev,
  conf: { distDir: nextjsDistDir },
});
const nextjsHandle = nextjsServer.getRequestHandler();

export const nextjs = onRequest(
  { memory: "1GiB", timeoutSeconds: 60 },
  async (req, res) => {
    await nextjsServer.prepare();
    return nextjsHandle(req, res);
  }
);
