export default function QuizProgress({ currentStep, totalSteps }) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-dark uppercase tracking-wide">
          Question {currentStep + 1} of {totalSteps}
        </span>
        <span className="text-sm font-bold text-primary">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-bg rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
