import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Goal from '../models/Goal.js';
import SleepEntry from '../models/SleepEntry.js';
import WaterLog from '../models/WaterLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const dummyUsers = [
  { name: 'Alice Johnson', email: 'alice@example.com', password: 'password123' },
  { name: 'Bob Smith', email: 'bob@example.com', password: 'password123' },
  { name: 'Carol Davis', email: 'carol@example.com', password: 'password123' },
  { name: 'David Wilson', email: 'david@example.com', password: 'password123' },
  { name: 'Emma Brown', email: 'emma@example.com', password: 'password123' },
  { name: 'Frank Miller', email: 'frank@example.com', password: 'password123' },
  { name: 'Grace Lee', email: 'grace@example.com', password: 'password123' },
  { name: 'Henry Taylor', email: 'henry@example.com', password: 'password123' },
  { name: 'Ivy Anderson', email: 'ivy@example.com', password: 'password123' },
  { name: 'Jack Thomas', email: 'jack@example.com', password: 'password123' },
];

const defaultGoals = [
  { type: 'exercise', label: 'Exercise Regularly', value: 4, unit: 'times/week', isDefault: true },
  { type: 'water', label: 'Drink Water', value: 3, unit: 'L/day', isDefault: true },
  { type: 'sleep', label: 'Improve Sleep', value: 8, unit: 'hours/night', isDefault: true },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Goal.deleteMany({});
    await SleepEntry.deleteMany({});
    await WaterLog.deleteMany({});
    console.log('Existing data cleared');

    console.log('Creating users...');
    const createdUsers = [];

    for (const userData of dummyUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        name: userData.name,
        displayName: userData.name,
        email: userData.email,
        passwordHash,
      });
      createdUsers.push(user);
      console.log(`  Created user: ${user.name} (${user.email})`);
    }

    console.log('\nCreating goals for each user...');
    for (const user of createdUsers) {
      for (const goal of defaultGoals) {
        await Goal.create({
          userId: user._id,
          ...goal,
        });
      }

      const customGoals = [
        { type: 'custom', label: 'Meditate', value: getRandomInt(10, 30), unit: 'min/day', isDefault: false },
        { type: 'custom', label: 'Read Books', value: getRandomInt(20, 60), unit: 'pages/day', isDefault: false },
      ];

      for (const goal of customGoals) {
        if (Math.random() > 0.5) {
          await Goal.create({
            userId: user._id,
            ...goal,
          });
        }
      }
      console.log(`  Created goals for: ${user.name}`);
    }

    console.log('\nCreating water logs for each user (past 14 days)...');
    for (const user of createdUsers) {
      for (let i = 0; i < 14; i++) {
        const date = getDateDaysAgo(i);
        const amountMl = getRandomInt(1500, 4000);
        
        await WaterLog.create({
          userId: user._id,
          date,
          amountMl,
        });
      }
      console.log(`  Created water logs for: ${user.name}`);
    }

    console.log('\nCreating sleep entries for each user (past 14 days)...');
    for (const user of createdUsers) {
      for (let i = 0; i < 14; i++) {
        const date = getDateDaysAgo(i);
        const durationMinutes = getRandomInt(300, 540);
        const restedPercent = getRandomInt(60, 95);
        const remPercent = getRandomInt(15, 30);
        const deepSleepPercent = getRandomInt(15, 35);
        
        await SleepEntry.create({
          userId: user._id,
          date,
          durationMinutes,
          restedPercent,
          remPercent,
          deepSleepPercent,
          notes: '',
        });
      }
      console.log(`  Created sleep entries for: ${user.name}`);
    }

    console.log('\n========================================');
    console.log('Database seeded successfully!');
    console.log('========================================');
    console.log('\nYou can now log in with any of these accounts:');
    console.log('Password for all accounts: password123\n');
    dummyUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
    });
    console.log('\n========================================');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
