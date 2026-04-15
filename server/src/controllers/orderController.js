const prisma = require('../utils/prisma');

const getOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        store: {
          userId: req.user.id
        }
      },
      include: {
        store: true,
        items: {
          include: {
            campaignProduct: {
              include: {
                campaign: true
              }
            }
          }
        }
      }
    });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        store: true,
        items: {
          include: {
            campaignProduct: {
              include: {
                artwork: true,
                campaign: true
              }
            }
          }
        }
      }
    });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  getOrders,
  getOrderById
};
