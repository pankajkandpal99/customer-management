import axios from "axios";
import cron from "node-cron";

import axios from "axios";
import cron from "node-cron";

if (process.env.NODE_ENV !== "production") {
  cron.schedule("* * * * *", async () => {
    console.log("⏳ Running overdue payment check...");

    try {
      const response = await axios.get(
        "http://localhost:3000/api/cron/overdue"
      );
      console.log("Overdue payment check completed:", response.data);
    } catch (error) {
      console.error("Error in overdue payment cron job:", error);
    }
  });

  console.log("Cron job scheduled for overdue payment check.");
} else {
  console.log("Cron job is disabled in production.");
}
