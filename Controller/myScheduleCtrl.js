const Schedule = require("../Model/myScheduleModel");
const orderSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.body;
    const existingOrder = await Schedule.findOne({ userId, date });
    if (existingOrder) {
      return res.status(409).json({ error: 'An order already exists for this user and date.' });
    }
    const newScheduleOrder = new Schedule({ userId, date });
    await newScheduleOrder.save();
    return res.status(201).json({ data: newScheduleOrder, message: 'Order Schedule Successfully Created', status: 200 });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to schedule the order.' });
  }
}
const getSchedule = async (req, res) => {
  const id = req.params.id;
  try {
    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    return res.status(200).json({ data: schedule, message: 'Schedule successfully retrieved.', status: 200 });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve schedule order.' });
  }
};
const deleteSchedule = async (req, res) => {
  try {
    const faq = await Schedule.findById(req.params.id);
    if (!faq) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    await Schedule.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Schedule Deleted Successfully", });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = { orderSchedule, getSchedule, deleteSchedule }