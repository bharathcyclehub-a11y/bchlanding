import { Link } from 'react-router-dom';

const steps = [
  {
    number: '01',
    title: 'Book for ₹99',
    description: 'Take our 60-second quiz and pay just ₹99. Adjusted in your final purchase.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'We Bring 5 Bikes',
    description: 'Our experts curate 5 bicycles based on your preferences, delivered to your door.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Try in Your Area',
    description: 'Ride each bicycle in your neighbourhood. No rush, no pressure, no showroom hassle.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Buy with Confidence',
    description: 'Pick your favourite. Free assembly, delivery, and 5-year warranty included.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 sm:py-16 bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #0A0A0A 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-primary text-xs sm:text-sm uppercase tracking-[0.25em] font-medium mb-3">
            Simple Process
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-dark mb-3 tracking-wider uppercase">
            How It Works
          </h2>
          <p className="text-gray-text/70 text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-light">
            India's first doorstep bicycle test ride — in just 4 steps
          </p>
        </div>

        {/* Steps - Horizontal scroll on mobile, grid on sm+ */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-4 sm:pb-0 px-4 sm:px-6 scrollbar-hide snap-x snap-mandatory max-w-6xl sm:mx-auto">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="relative group flex-shrink-0 w-[calc(100vw-2rem)] sm:w-auto snap-start"
            >
              {/* Connector line (desktop) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px z-0">
                  <div className="w-[calc(100%-40px)] mx-auto h-px bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />
                </div>
              )}

              <div className="relative h-full rounded-2xl border border-gray-100 bg-gray-bg p-5 sm:p-6 hover:border-primary/20 hover:shadow-lg transition-all duration-500">
                {/* Number + Icon row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {step.icon}
                  </div>
                  <span className="font-display text-4xl text-gray-100 group-hover:text-primary/20 tracking-wider transition-colors duration-500 select-none">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-semibold text-dark text-base mb-1.5 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-text text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8 sm:mt-12 max-w-6xl mx-auto px-4 sm:px-6">
          <Link
            to="/test-ride"
            className="group inline-flex items-center gap-3 bg-primary text-white font-semibold text-sm sm:text-base px-8 sm:px-10 py-3.5 sm:py-4 rounded-full hover:bg-primary-dark transition-all duration-500 shadow-lg shadow-primary/25 hover:shadow-primary/40"
          >
            Start Your Test Ride
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-gray-text/60 text-xs mt-3">₹99 booking fee — adjusted in your purchase</p>
        </div>
      </div>
    </section>
  );
}
