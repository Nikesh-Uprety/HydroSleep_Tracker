import Goal from '../models/Goal.js';

const DEFAULT_GOALS = [
  {
    type: 'exercise',
    label: 'Exercise Regularly',
    value: 4,
    unit: 'times/week',
    isDefault: true
  },
  {
    type: 'water',
    label: 'Drink Water',
    value: 3,
    unit: 'L/day',
    isDefault: true
  },
  {
    type: 'sleep',
    label: 'Improve Sleep',
    value: 8,
    unit: 'hours/night',
    isDefault: true
  }
];

export const createDefaultGoals = async (userId) => {
  const existingGoals = await Goal.findOne({ userId });
  
  if (!existingGoals) {
    const goals = DEFAULT_GOALS.map(goal => ({
      ...goal,
      userId
    }));
    await Goal.insertMany(goals);
  }
};

export default createDefaultGoals;
