const Registration = require('../model/Registration');

exports.getRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res
      .status(500)
      .json({ message: 'Server error while fetching registrations' });
  }
};

exports.createRegistration = async (req, res) => {
  try {
    const {
      fullName,
      program,
      accountNumber,
      accountName,
      verificationCode
    } = req.body;

    const registration = new Registration({
      fullName,
      program,
      accountNumber,
      accountName,
      verificationCode
    });

    await registration.save();

    res.status(201).json(registration);
  } catch (error) {
    console.error('Error creating registration:', error);
    res
      .status(500)
      .json({ message: 'Server error while creating registration' });
  }
};
