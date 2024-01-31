// middleware/checkSubscription.js

const checkSubscription = (req, res, next) => {
    const { user } = req;
  
    // Check if the user has an active subscription for a specific order
    const currentDate = new Date();
  
    const activeSubscription = user.subscriptions.find(
      (subscription) =>
        currentDate >= subscription.startDate &&
        currentDate <= subscription.endDate &&
        subscription.type === 'subscription' &&
        subscription.orderId // Check if there's an orderId
    );
  
    if (!activeSubscription) {
      return res.status(403).json({ message: 'Subscription not active for the order' });
    }
  
    next();
  };
  
  module.exports = checkSubscription;
  