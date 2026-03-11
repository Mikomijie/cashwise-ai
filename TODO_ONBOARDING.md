# Task: Add User Onboarding Flow

## Plan
- [x] Step 1: Database Schema
  - [x] Create user_profiles table
  - [x] Update conversations table to link to user profiles
- [x] Step 2: Create Onboarding Components
  - [x] Build OnboardingPage with multi-step form
  - [x] Create step components for each question
  - [x] Add progress indicator
- [x] Step 3: Update Routes and Navigation
  - [x] Add /onboarding route
  - [x] Update HomePage CTA to link to onboarding
  - [x] Update ChatPage to accept user profile data
- [x] Step 4: Personalization
  - [x] Generate personalized welcome message
  - [x] Store user profile in database
- [x] Step 5: Validation
  - [x] Run lint and fix issues

## Notes
- ✅ 4 questions implemented: Name, Income, Spending, Goal
- ✅ One question at a time with clean UI and smooth transitions
- ✅ Same green/gold design theme maintained
- ✅ Personalized welcome message in chat after completion
- ✅ Progress indicator shows completion percentage
- ✅ Back button for navigation between steps
- ✅ Skip option available for users who want to go directly to chat
- ✅ All lint checks passed
