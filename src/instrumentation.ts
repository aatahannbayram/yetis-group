export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Node's default for an unhandled promise rejection is to crash the
  // whole process. With no handler in place, any fire-and-forget async
  // call anywhere in the app (a webhook side-effect, a background write)
  // that rejects takes down every in-flight request on the server, which
  // then restarts - the exact pattern behind the production 504/restart
  // loop. Logging instead of crashing keeps one bad background promise
  // from killing the server; the trace below is what to grep logs for.
  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });

  // uncaughtException means the process is in an undefined state - per
  // Node's own guidance we should not keep serving requests after one.
  // Log with full detail (the host's watchdog only captured a bare
  // restart with no error text) then exit so the process manager
  // restarts us cleanly.
  process.on("uncaughtException", (error) => {
    console.error("[uncaughtException]", error);
    process.exit(1);
  });
}
