const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { sendAchievementEmail } = require('./emailService');

// All available achievements in the system
const ACHIEVEMENTS_LIST = [
  // Milestone achievements
  {
    key: 'the_initiate',
    name: 'The Initiate',
    title: 'Welcome to the Library',
    description: 'You have taken your first step into a larger world. Creating an account marks the beginning of your legendary journey.',
    icon: 'user-plus',
    category: 'milestone',
    points: 10,
    rarity: 'common',
    order: 1
  },
  {
    key: 'first_download',
    name: 'The Collector',
    title: 'First Download',
    description: 'Downloaded your first book. Every great library starts with a single tome.',
    icon: 'download',
    category: 'milestone',
    points: 15,
    rarity: 'common',
    order: 2
  },
  {
    key: 'first_read',
    name: 'The Scholar',
    title: 'First Read',
    description: 'Opened and read your first book. Knowledge is the true currency of power.',
    icon: 'book-open',
    category: 'milestone',
    points: 15,
    rarity: 'common',
    order: 3
  },
  {
    key: 'first_favorite',
    name: 'The Curator',
    title: 'First Favorite',
    description: 'Saved your first book to favorites. A wise reader knows which tomes deserve a place of honor.',
    icon: 'heart',
    category: 'milestone',
    points: 10,
    rarity: 'common',
    order: 4
  },
  // Reading achievements
  {
    key: 'bookworm',
    name: 'Bookworm',
    title: 'Read 5 Books',
    description: 'Read 5 different books. The worm has awakened - your appetite for knowledge grows!',
    icon: 'book',
    category: 'reading',
    points: 25,
    rarity: 'uncommon',
    order: 5
  },
  {
    key: 'master_reader',
    name: 'Master Reader',
    title: 'Read 10 Books',
    description: 'Read 10 different books. Few reach this level of dedication. You are becoming a legend.',
    icon: 'graduation-cap',
    category: 'reading',
    points: 50,
    rarity: 'rare',
    order: 6
  },
  {
    key: 'grand_master',
    name: 'Grand Master',
    title: 'Read 25 Books',
    description: 'Read 25 books. Your wisdom is spoken of in hushed tones across the realm.',
    icon: 'crown',
    category: 'reading',
    points: 100,
    rarity: 'epic',
    order: 7
  },
  {
    key: 'the_chosen_one',
    name: 'The Chosen One',
    title: 'Read 50 Books',
    description: 'Read 50 books. Legends speak of one who would consume libraries. That one is you.',
    icon: 'sparkles',
    category: 'reading',
    points: 200,
    rarity: 'legendary',
    order: 8
  },
  // Engagement achievements
  {
    key: 'maverick',
    name: 'Maverick',
    title: '3-Day Streak',
    description: 'Maintained a 3-day reading streak. You play by your own rules - and they demand daily reading!',
    icon: 'flame',
    category: 'engagement',
    points: 20,
    rarity: 'uncommon',
    order: 9
  },
  {
    key: 'sentinel',
    name: 'Sentinel',
    title: '7-Day Streak',
    description: 'A full week of consistent reading. You guard your knowledge with unwavering discipline.',
    icon: 'shield',
    category: 'engagement',
    points: 40,
    rarity: 'rare',
    order: 10
  },
  {
    key: 'oathkeeper',
    name: 'Oathkeeper',
    title: '14-Day Streak',
    description: 'Two weeks of dedication! You made an oath to learn, and you keep it faithfully.',
    icon: 'sword',
    category: 'engagement',
    points: 75,
    rarity: 'epic',
    order: 11
  },
  {
    key: 'lord_commander',
    name: 'Lord Commander',
    title: '30-Day Streak',
    description: 'A full month of reading every day. You command respect and inspire others to follow.',
    icon: 'castle',
    category: 'engagement',
    points: 150,
    rarity: 'legendary',
    order: 12
  },
  // Collection achievements
  {
    key: 'treasure_hunter',
    name: 'Treasure Hunter',
    title: 'Download 10 Books',
    description: 'Downloaded 10 books. Your personal collection grows with each expedition!',
    icon: 'archive',
    category: 'milestone',
    points: 30,
    rarity: 'uncommon',
    order: 13
  },
  {
    key: 'admiral',
    name: 'Admiral',
    title: 'Download 25 Books',
    description: 'Downloaded 25 books. You command a fleet of knowledge vessels!',
    icon: 'anchor',
    category: 'milestone',
    points: 60,
    rarity: 'rare',
    order: 14
  },
  {
    key: 'supreme_leader',
    name: 'Supreme Leader',
    title: 'Download 50 Books',
    description: 'Downloaded 50 books. Your digital library rivals ancient Alexandria.',
    icon: 'library',
    category: 'milestone',
    points: 120,
    rarity: 'epic',
    order: 15
  },
  // Favorites achievements
  {
    key: 'connoisseur',
    name: 'Connoisseur',
    title: 'Favorite 10 Books',
    description: 'Curated 10 favorites. You have refined taste in literature.',
    icon: 'star',
    category: 'social',
    points: 25,
    rarity: 'uncommon',
    order: 16
  },
  {
    key: 'master_chief',
    name: 'Master Chief',
    title: 'Favorite 25 Books',
    description: 'Curated 25 favorites. You lead the charge in discovering great reads!',
    icon: 'medal',
    category: 'social',
    points: 50,
    rarity: 'rare',
    order: 17
  },
  // Time-based achievements
  {
    key: 'night_owl',
    name: 'Night Owl',
    title: 'Study 10 Hours',
    description: 'Accumulated 10 hours of study time. The night belongs to scholars like you.',
    icon: 'moon',
    category: 'engagement',
    points: 35,
    rarity: 'uncommon',
    order: 18
  },
  {
    key: 'time_lord',
    name: 'Time Lord',
    title: 'Study 50 Hours',
    description: 'Accumulated 50 hours of study time. You bend time itself to serve your quest for knowledge.',
    icon: 'clock',
    category: 'engagement',
    points: 100,
    rarity: 'epic',
    order: 19
  },
  // Special achievements
  {
    key: 'explorer',
    name: 'Explorer',
    title: 'Read from 3 Categories',
    description: 'Read books from 3 different categories. A true explorer knows no boundaries!',
    icon: 'compass',
    category: 'special',
    points: 30,
    rarity: 'uncommon',
    order: 20
  },
  {
    key: 'polymath',
    name: 'Polymath',
    title: 'Read from 5 Categories',
    description: 'Read books from 5 different categories. Your knowledge spans multiple disciplines!',
    icon: 'brain',
    category: 'special',
    points: 75,
    rarity: 'rare',
    order: 21
  }
];

// Seed achievements to database
async function seedAchievements() {
  try {
    for (const achievement of ACHIEVEMENTS_LIST) {
      await Achievement.findOneAndUpdate(
        { key: achievement.key },
        achievement,
        { upsert: true, new: true }
      );
    }
    console.log('Achievements seeded successfully');
  } catch (err) {
    console.error('Error seeding achievements:', err);
  }
}

// Check and unlock achievement for a user
async function unlockAchievement(userId, achievementKey) {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Check if already unlocked
    const alreadyUnlocked = user.achievements.some(a => a.achievementKey === achievementKey);
    if (alreadyUnlocked) return null;

    // Get achievement details
    const achievement = await Achievement.findOne({ key: achievementKey });
    if (!achievement) return null;

    // Unlock achievement
    user.achievements.push({
      achievementKey: achievementKey,
      unlockedAt: new Date()
    });
    user.totalPoints = (user.totalPoints || 0) + achievement.points;
    await user.save();

    // Send achievement email asynchronously
    sendAchievementEmail(user.email, user.name, achievement).catch(err => {
      console.error('Achievement email failed:', err);
    });

    return {
      unlocked: true,
      achievement: {
        key: achievement.key,
        name: achievement.name,
        title: achievement.title,
        description: achievement.description,
        points: achievement.points,
        rarity: achievement.rarity,
        icon: achievement.icon
      }
    };
  } catch (err) {
    console.error('Error unlocking achievement:', err);
    return null;
  }
}

// Check achievements based on user stats
async function checkAndUnlockAchievements(userId, triggerType, extraData = {}) {
  const unlockedAchievements = [];
  
  try {
    const user = await User.findById(userId);
    if (!user) return unlockedAchievements;

    const unlocked = user.achievements.map(a => a.achievementKey);

    // Helper to unlock if not already done
    const tryUnlock = async (key) => {
      if (!unlocked.includes(key)) {
        const result = await unlockAchievement(userId, key);
        if (result) unlockedAchievements.push(result.achievement);
      }
    };

    switch (triggerType) {
      case 'signup':
        await tryUnlock('the_initiate');
        break;

      case 'download':
        if (!unlocked.includes('first_download')) {
          await tryUnlock('first_download');
        }
        if (user.downloads?.length >= 10) await tryUnlock('treasure_hunter');
        if (user.downloads?.length >= 25) await tryUnlock('admiral');
        if (user.downloads?.length >= 50) await tryUnlock('supreme_leader');
        break;

      case 'read':
        if (!unlocked.includes('first_read')) {
          await tryUnlock('first_read');
        }
        if (user.totalBooksRead >= 5) await tryUnlock('bookworm');
        if (user.totalBooksRead >= 10) await tryUnlock('master_reader');
        if (user.totalBooksRead >= 25) await tryUnlock('grand_master');
        if (user.totalBooksRead >= 50) await tryUnlock('the_chosen_one');
        break;

      case 'favorite':
        if (!unlocked.includes('first_favorite')) {
          await tryUnlock('first_favorite');
        }
        if (user.favorites?.length >= 10) await tryUnlock('connoisseur');
        if (user.favorites?.length >= 25) await tryUnlock('master_chief');
        break;

      case 'streak':
        if (user.readingStreak >= 3) await tryUnlock('maverick');
        if (user.readingStreak >= 7) await tryUnlock('sentinel');
        if (user.readingStreak >= 14) await tryUnlock('oathkeeper');
        if (user.readingStreak >= 30) await tryUnlock('lord_commander');
        break;

      case 'study_time':
        if (user.studyHours >= 10) await tryUnlock('night_owl');
        if (user.studyHours >= 50) await tryUnlock('time_lord');
        break;

      case 'categories':
        const categoryCount = extraData.categoryCount || 0;
        if (categoryCount >= 3) await tryUnlock('explorer');
        if (categoryCount >= 5) await tryUnlock('polymath');
        break;
    }

    return unlockedAchievements;
  } catch (err) {
    console.error('Error checking achievements:', err);
    return unlockedAchievements;
  }
}

// Get all achievements with user's unlock status
async function getUserAchievements(userId) {
  try {
    const user = await User.findById(userId);
    const allAchievements = await Achievement.find().sort({ order: 1 });

    const userUnlocked = user?.achievements || [];
    const unlockedMap = {};
    userUnlocked.forEach(a => {
      unlockedMap[a.achievementKey] = a.unlockedAt;
    });

    return allAchievements.map(a => ({
      key: a.key,
      name: a.name,
      title: a.title,
      description: a.description,
      icon: a.icon,
      category: a.category,
      points: a.points,
      rarity: a.rarity,
      unlocked: !!unlockedMap[a.key],
      unlockedAt: unlockedMap[a.key] || null
    }));
  } catch (err) {
    console.error('Error getting user achievements:', err);
    return [];
  }
}

module.exports = {
  ACHIEVEMENTS_LIST,
  seedAchievements,
  unlockAchievement,
  checkAndUnlockAchievements,
  getUserAchievements
};
