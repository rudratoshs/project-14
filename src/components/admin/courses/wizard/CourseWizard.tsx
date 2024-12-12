import { useState, useCallback, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { SubscriptionCheck } from '@/components/subscription/SubscriptionCheck';
import BasicInfoStep from './steps/BasicInfoStep';
import TopicsStep from './steps/TopicsStep';
import PreviewStep from './steps/PreviewStep';
import GenerationStep from './steps/GenerationStep';
import { CreateCourseData } from '@/lib/types/course';
import { cn } from '@/lib/utils';

interface CourseWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const STEPS = [
  { id: 'basic-info', title: 'Basic Information' },
  { id: 'topics', title: 'Topics Configuration' },
  { id: 'preview', title: 'Course Preview' },
  { id: 'generation', title: 'Course Generation' },
];

export default function CourseWizard({ open, onOpenChange, onSuccess }: CourseWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [courseData, setCourseData] = useState<Partial<CreateCourseData>>({
    type: 'image_theory',
    accessibility: 'free',
    numTopics: 5,
  });
  const [jobId, setJobId] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const updateCourseData = useCallback((data: Partial<CreateCourseData>) => {
    setCourseData((prev) => ({ ...prev, ...data }));
  }, []);

  const handleValidationChange = useCallback((valid: boolean) => {
    setIsValid(valid);
  }, []);

  useEffect(() => {
    if (!open) {
      setCurrentStep(0);
      setCourseData({
        type: 'image_theory',
        accessibility: 'free',
        numTopics: 5,
      });
      setJobId(null);
      setIsValid(false);
    }
  }, [open]);

  const renderStep = () => {
    // Wrap content in SubscriptionCheck for steps that need validation
    const content = (() => {
      switch (currentStep) {
        case 0:
          return (
            <BasicInfoStep
              data={courseData}
              onUpdate={updateCourseData}
              onValidationChange={handleValidationChange}
            />
          );
        case 1:
          return (
            <TopicsStep
              data={courseData}
              onUpdate={updateCourseData}
              onValidationChange={handleValidationChange}
            />
          );
        case 2:
          return (
            <PreviewStep
              data={courseData as CreateCourseData}
              onProceed={handleNext}
              onModify={handleBack}
            />
          );
        case 3:
          return (
            <GenerationStep
              data={courseData as CreateCourseData}
              onSuccess={onSuccess}
              onJobIdChange={setJobId}
            />
          );
        default:
          return null;
      }
    })();

    // Only wrap steps that need subscription validation
    return currentStep < 2 ? (
      <SubscriptionCheck
        courseType={courseData.type || 'image_theory'}
        numTopics={courseData.numTopics || 0}
        numSubtopics={courseData.subtopics?.length || 0}
      >
        {content}
      </SubscriptionCheck>
    ) : (
      content
    );
  };

  return (
    <DialogContent className="max-w-3xl p-0 flex flex-col h-[90vh]">
      <div className="flex-none">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Create New Course</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: `${100 / STEPS.length}%` }}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors',
                    index <= currentStep
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {index + 1}
                </div>
                <span className="text-sm text-center">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">{renderStep()}</div>
      </div>
      {currentStep < STEPS.length - 1 && currentStep !== 2 && (
        <div className="flex-none border-t bg-white p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isValid}
              className={cn(
                !isValid && 'opacity-50 cursor-not-allowed'
              )}
            >
              {currentStep === 1 ? (
                <>
                  Preview
                  <Eye className={`ml-2 h-4 w-4 ${jobId}`} />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </DialogContent>
  );
}