const prisma = require('../utils/prisma');

const getTasks = async (req, res) => {
  try {
    const logs = await prisma.taskLog.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to recent 50
      include: {
        user: { select: { name: true } }
      }
    });

    const tasks = logs.map(log => ({
      id: log.id,
      name: log.name,
      status: log.status,
      detail: log.detail,
      createdOn: new Date(log.createdAt).toLocaleString(),
      startedOn: new Date(log.createdAt).toLocaleString(),
      finishedOn: new Date(log.createdAt).toLocaleString(),
      duration: "Completed instantly",
      createdBy: log.user?.name || "Member"
    }));

    res.json(tasks);
  } catch (err) {
    console.error("[getTasks] error:", err.message);
    res.status(500).send('Server error');
  }
};

module.exports = { getTasks };
