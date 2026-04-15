const prisma = require('./prisma');

/**
 * Log a task/activity to the database
 * @param {number} userId - The ID of the user performing the action
 * @param {string} name - The name of the action (e.g. "Upload Artwork")
 * @param {string} status - Result status (e.g. "Success", "Failed")
 * @param {string} detail - Additional details (e.g. "Uploaded beer.png")
 */
const logTask = async (userId, name, status = "Success", detail = "") => {
  try {
    if (!userId) {
      console.warn("[Logger] userId is required for logging tasks");
      return;
    }

    await prisma.taskLog.create({
      data: {
        userId,
        name,
        status,
        detail,
      }
    });
  } catch (err) {
    console.error("[Logger] Failed to create task log:", err.message);
  }
};

module.exports = { logTask };
