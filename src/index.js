import connectDB from "./db/index.js";
import { app } from "./app.js";
import { createServer } from "http";
import { initializeSocket } from "./socket/socketManager.js";

connectDB()
  .then(() => {
    app.on("error", (err) => {
      console.log(err);
      throw err;
    });

    // Create HTTP server instead of directly using app.listen
    const server = createServer(app);

    // Initialize Socket.IO
    initializeSocket(server);

    server.listen(process.env.PORT || 8000, () =>
      console.log(`Server is listening on ${process.env.PORT}`)
    );
  })
  .catch((err) =>
    console.log(`Database connection failed from index.js ${err}`)
  );
