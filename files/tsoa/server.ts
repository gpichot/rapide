import { app } from "./app";

const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOSTNAME || "0.0.0.0";

app.listen(port, hostname, () => {
  console.log(`Listening on http://${hostname}:${port}`);
});
