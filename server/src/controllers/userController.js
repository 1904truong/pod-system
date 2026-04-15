const prisma = require('../utils/prisma');

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        settings: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar, payoutMethod, receiveEmails } = req.body;

    const userUpdate = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar })
      }
    });

    const settingsUpdate = await prisma.setting.update({
      where: { userId: req.user.id },
      data: {
        ...(payoutMethod && { payoutMethod }),
        ...(receiveEmails !== undefined && { receiveEmails })
      }
    });

    res.json({ user: userUpdate, settings: settingsUpdate });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getProfile,
  updateProfile
};
