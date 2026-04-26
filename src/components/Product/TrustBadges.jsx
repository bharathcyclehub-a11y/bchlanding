import { motion } from 'framer-motion';

const badges = [
  {
    id: 'warranty',
    icon: '✓',
    text: '1 Year Warranty',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    iconColor: 'text-green-600'
  },
  {
    id: 'delivery',
    icon: '🚚',
    text: 'Free Delivery',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  },
  {
    id: 'returns',
    icon: '↻',
    text: '7-Day Returns',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600'
  },
  {
    id: 'assembly',
    icon: '⚡',
    text: 'Quick Assembly',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600'
  }
];

export default function TrustBadges() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`${badge.bgColor} ${badge.textColor} rounded-xl px-3 py-2.5 flex items-center gap-2 border border-${badge.textColor.replace('text-', '')}/20`}
        >
          <span className={`text-xl ${badge.iconColor} font-bold`}>
            {badge.icon}
          </span>
          <span className="text-xs sm:text-sm font-semibold">
            {badge.text}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
