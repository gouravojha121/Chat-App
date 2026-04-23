const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route GET /api/users/search?q=username
router.get('/search', protect, async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('username email isOnline').limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/users/contacts
router.get('/contacts', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('contacts', 'username email isOnline');
    res.json(user.contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route POST /api/users/contacts/:id
router.post('/contacts/:id', protect, async (req, res) => {
  try {
    const contactId = req.params.id;
    const user = await User.findById(req.user._id);

    if (user.contacts.includes(contactId))
      return res.status(400).json({ message: 'Already in contacts' });

    if (contactId === req.user._id.toString())
      return res.status(400).json({ message: 'Cannot add yourself' });

    user.contacts.push(contactId);
    await user.save();

    const contact = await User.findById(contactId).select('username email isOnline');
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/users/contacts/:id
router.delete('/contacts/:id', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { contacts: req.params.id }
    });
    res.json({ message: 'Contact removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
