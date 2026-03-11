import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { createUserProfile } from '@/db/api';
import { initializeSampleData } from '@/db/sampleData';
import type { OnboardingData } from '@/types';

const SPENDING_OPTIONS = [
  { value: 'food', label: '🍽️ Food' },
  { value: 'transport', label: '🚗 Transport' },
  { value: 'data_airtime', label: '📱 Data/Airtime' },
  { value: 'rent', label: '🏠 Rent' },
  { value: 'entertainment', label: '🎉 Entertainment' },
];

const GOAL_OPTIONS = [
  { value: 'save_more', label: '💰 Save more money' },
  { value: 'get_out_debt', label: '💳 Get out of debt' },
  { value: 'start_business', label: '🚀 Start a business' },
  { value: 'understand_money', label: '📚 Understand money better' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    name: '',
    monthly_income: '',
    main_spending: '',
    financial_goal: '',
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const profile = await createUserProfile({
        name: formData.name,
        monthly_income: formData.monthly_income,
        main_spending: formData.main_spending,
        financial_goal: formData.financial_goal,
      });

      if (profile) {
        // Initialize sample data for demo purposes
        await initializeSampleData(profile.id);
        
        // Navigate to dashboard after onboarding
        navigate('/dashboard', { state: { userProfileId: profile.id } });
      } else {
        console.error('Failed to create user profile');
        // Still navigate to dashboard even if profile creation fails
        navigate('/dashboard', { state: { userName: formData.name } });
      }
    } catch (error) {
      console.error('Error submitting onboarding:', error);
      navigate('/dashboard', { state: { userName: formData.name } });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 0;
      case 2:
        return formData.monthly_income.trim().length > 0;
      case 3:
        return formData.main_spending.length > 0;
      case 4:
        return formData.financial_goal.length > 0;
      default:
        return false;
    }
  };

  const handleOptionSelect = (field: keyof OnboardingData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Let's Get Started</span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            Welcome to <span className="gradient-text">CashWise AI</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Answer a few quick questions so we can personalize your experience
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Step {step} of {totalSteps}</span>
            <span className="font-medium text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-2 shadow-lg">
          <CardContent className="p-8 md:p-12">
            <div className="animate-fade-in">
              {/* Step 1: Name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold md:text-3xl">What's your name?</h2>
                    <p className="text-muted-foreground">We'd love to know what to call you</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">Your Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Income */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold md:text-3xl">
                      What's your monthly income?
                    </h2>
                    <p className="text-muted-foreground">In your local currency (approximate is fine)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="income" className="text-base">Monthly Income</Label>
                    <Input
                      id="income"
                      type="text"
                      placeholder="e.g., 50,000 NGN or 5,000 KES"
                      value={formData.monthly_income}
                      onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                      className="h-12 text-lg"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Spending */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold md:text-3xl">
                      What do you spend most money on?
                    </h2>
                    <p className="text-muted-foreground">Choose your biggest expense category</p>
                  </div>
                  <div className="grid gap-3">
                    {SPENDING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect('main_spending', option.value)}
                        className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                          formData.main_spending === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                      >
                        <span className="text-2xl">{option.label.split(' ')[0]}</span>
                        <span className="flex-1 font-medium">{option.label.split(' ').slice(1).join(' ')}</span>
                        {formData.main_spending === option.value && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Goal */}
              {step === 4 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold md:text-3xl">
                      What's your biggest financial goal?
                    </h2>
                    <p className="text-muted-foreground">What would you like to achieve?</p>
                  </div>
                  <div className="grid gap-3">
                    {GOAL_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleOptionSelect('financial_goal', option.value)}
                        className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:bg-primary/5 ${
                          formData.financial_goal === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                      >
                        <span className="text-2xl">{option.label.split(' ')[0]}</span>
                        <span className="flex-1 font-medium">{option.label.split(' ').slice(1).join(' ')}</span>
                        {formData.financial_goal === option.value && (
                          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="h-12"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting}
                className="h-12 flex-1"
              >
                {isSubmitting ? (
                  'Setting up...'
                ) : step === totalSteps ? (
                  <>
                    Start Coaching
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
