import { motion } from 'framer-motion';
import { electricFreebies } from '../../data/electricFreebies';

// SVG icons for each accessory type
const accessoryIcons = {
  bell: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  lock: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  mudguard: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  'bottle-holder': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3h6v2H9V3zm0 2v2a3 3 0 00-3 3v8a3 3 0 003 3h6a3 3 0 003-3v-8a3 3 0 00-3-3V5" />
    </svg>
  ),
  bottle: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 3h4v3h-4V3zm-1 3v1.5A3.5 3.5 0 005.5 11v7A2.5 2.5 0 008 20.5h8a2.5 2.5 0 002.5-2.5v-7A3.5 3.5 0 0015 7.5V6H9z" />
    </svg>
  ),
  pump: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v18m0-18l-3 3m3-3l3 3M8 12h8M6 18h12" />
    </svg>
  ),
  helmet: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4C8 4 4 8 4 12v2a2 2 0 002 2h1a1 1 0 001-1v-1a4 4 0 018 0v1a1 1 0 001 1h1a2 2 0 002-2v-2c0-4-4-8-8-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 16v2a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  ),
  glasses: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12c0-2 2-5 5.5-5s4.5 3 4.5 5m0 0c0-2 1-5 4.5-5s5.5 3 5.5 5M12 12c0 0-1 0-2 0m4 0c1 0 2 0 2 0" />
    </svg>
  ),
  light: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  'seat-cover': (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 17l2-8h10l2 8M7 17h10M9 9V6a3 3 0 016 0v3" />
    </svg>
  ),
  gift: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  ),
};

// SVG icons for warranty/service items
const warrantyIcons = {
  shield: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  battery: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7h14a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm18 4v2M7 11v2m3-2v2m3-2v2" />
    </svg>
  ),
  motor: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  wrench: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  truck: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function FreeWithElectric() {
  const { accessories, warranty } = electricFreebies;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-12 sm:mt-16"
    >
      <h2 className="font-display text-xl sm:text-2xl font-bold text-dark uppercase tracking-wider mb-6">
        Accessories by <span className="text-primary">BCH</span>
      </h2>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-500 px-5 py-3 sm:py-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm sm:text-base">FREE with every Electric Cycle</p>
            <p className="text-white/80 text-xs sm:text-sm">All these accessories & services included at no extra cost</p>
          </div>
        </div>

        {/* Accessories Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-4 sm:p-6"
        >
          {accessories.map((item) => (
            <motion.div
              key={item.name}
              variants={itemVariants}
              className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-100 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0 text-green-600 shadow-sm">
                {accessoryIcons[item.icon]}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark truncate">{item.name}</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">FREE</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-4 sm:mx-6" />

        {/* Warranty & Services Strip */}
        <div className="p-4 sm:p-6">
          <p className="text-xs font-bold text-dark uppercase tracking-wider mb-3">Warranty & Services</p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
          >
            {warranty.map((item) => (
              <motion.div
                key={item.label}
                variants={itemVariants}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-100"
              >
                <div className="text-amber-600 mb-2">
                  {warrantyIcons[item.icon]}
                </div>
                <p className="text-lg sm:text-xl font-bold text-dark leading-tight">{item.value}</p>
                <p className="text-[10px] sm:text-xs text-gray-text mt-0.5">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
