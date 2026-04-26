import CTAButton from './CTAButton';
import CountUpNumber from './CountUpNumber';

const socialStats = [
  {
    platform: "YouTube",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    count: "2.35 LAKH",
    label: "SUBSCRIBERS",
    subtext: "10 Crore+ Views",
    link: "https://youtube.com/@bharathcyclehub?si=rNOy1owyFxN3O_Ap"
  },
  {
    platform: "Instagram",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    count: "50K+",
    label: "FOLLOWERS",
    subtext: "Active Community",
    link: "https://www.instagram.com/bharathcyclehub?igsh=bGJqNG5qZHRsMmdl"
  }
];

export default function SocialProof({ onCTAClick }) {
  return (
    <section className="bg-dark-light relative overflow-hidden">
      <div className="py-6 sm:py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* 1. Header + Subtext combined */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-normal text-white mb-1 sm:mb-2 tracking-wider uppercase">
              Trusted by <span className="text-primary">10,000+</span> Bangalore Families
            </h2>
            <p className="text-sm sm:text-lg text-gray-light max-w-2xl mx-auto">
              Parents find us on YouTube & Instagram — <span className="text-white font-semibold"><CountUpNumber end={10} suffix=" Crore+" duration={1800} /></span> views and counting
            </p>
          </div>

          {/* 2. Social stats - side by side on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto mb-4 sm:mb-6">
            {socialStats.map((stat, index) => (
              <a
                key={index}
                href={stat.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-4 p-4 sm:p-5 rounded-[20px] bg-dark-lighter border border-white/10 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 text-center sm:text-left"
              >
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center text-white">
                  {stat.icon}
                </div>
                <div>
                  <div className="font-display text-2xl sm:text-3xl text-primary mb-0.5 tracking-wider">{stat.count}</div>
                  <div className="text-xs sm:text-sm text-gray-light font-semibold tracking-wide">{stat.platform} {stat.label}</div>
                  {stat.subtext && (
                    <div className="text-[10px] sm:text-xs text-gray-light/70 mt-0.5">{stat.subtext}</div>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* 3. Engagement metrics with CountUp */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto mb-4 sm:mb-6">
            {[
              { end: 10, suffix: "K+", label: "Families Served", duration: 2000 },
              { end: 300, suffix: "+", label: "Bikes on Display", duration: 2200 },
              { end: 25, suffix: " Yrs", label: "In Business", duration: 1800 },
              { end: 8, suffix: "", label: "Expert Mechanics", duration: 1600 }
            ].map((metric, index) => (
              <div
                key={index}
                className="text-center p-3 sm:p-3 rounded-[15px] bg-dark border border-white/10"
              >
                <div className="font-display text-xl sm:text-2xl text-primary mb-0.5 sm:mb-1 tracking-wider">
                  <CountUpNumber end={metric.end} suffix={metric.suffix} duration={metric.duration} />
                </div>
                <div className="text-[10px] sm:text-xs text-gray-light font-semibold uppercase tracking-wide leading-tight">{metric.label}</div>
              </div>
            ))}
          </div>

          {/* 4. Small CTA Button */}
          <div className="flex justify-center">
            <CTAButton onClick={onCTAClick}>
              BOOK NOW - ONLY ₹99
            </CTAButton>
          </div>

        </div>
      </div>
    </section>
  );
}
