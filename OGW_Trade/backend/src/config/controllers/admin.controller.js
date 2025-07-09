const Admin = require('../models/Admin');

exports.createAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can create admins' });
    }
    
    const { username, password, role } = req.body;
    const existingAdmin = await Admin.findOne({ username });
    
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    const admin = new Admin({ username, password, role });
    await admin.save();
    
    res.status(201).json({ message: 'Admin created successfully', admin });
  } catch (error) {
    res.status(500).json({ message: 'Error creating admin', error });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can view all admins' });
    }
    
    const admins = await Admin.find({}, '-password');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admins', error });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmin can delete admins' });
    }
    
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting admin', error });
  }
};