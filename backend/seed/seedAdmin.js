import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Batch from '../models/Batch.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const admin = await User.findOne({ email: 'admin@biit.in' });
  if (!admin) {
    await User.create({
      name: 'Super Admin',
      email: 'admin@biit.in',
      password: 'Admin@12345',
      role: 'ADMIN'
    });
    console.log('Admin created: admin@biit.in / Admin@12345');
  } else {
    console.log('Admin already exists: admin@biit.in');
  }

  const courseCount = await Course.countDocuments();
  if (!courseCount) {
    const course = await Course.create({
      title: 'Graphic Design Mastery',
      category: 'Design',
      duration: '6 Months',
      fee: 5999,
      description: 'Photoshop, Illustrator, layout design, branding, and portfolio preparation.'
    });
    await Batch.create({
      name: 'Batch Graphic A',
      course: course._id,
      courseName: course.title,
      schedule: 'Mon to Fri, 10:00 AM - 12:00 PM',
      status: 'Running'
    });
    console.log('Sample course and batch created.');
  }

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});
