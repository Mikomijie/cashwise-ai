# CashWise AI Requirements Document

## 1. Application Overview

### 1.1 Application Name
CashWise AI

### 1.2 Application Description
A modern, premium financial coaching web application designed specifically for young Africans. The platform provides AI-powered financial coaching through an intuitive chat interface, helping users manage their money and plan their financial future. The design emphasizes warmth, trust, and human connection while maintaining a premium fintech aesthetic.

### 1.3 Target Language
English

## 2. Core Features

### 2.1 Homepage
- Bold hero section featuring the tagline: Your Money. Your Future. Your Coach.
- Call-to-action button labeled Start Your Journey to initiate user onboarding flow
- Clean, premium design with deep green and gold color palette
- Ample white space for modern, breathable layout
- Mobile-first responsive design

### 2.2 User Onboarding Flow
- Triggered when user clicks Start Your Journey button
- Display 4 questions sequentially, one at a time, in a clean and friendly screen
- Question 1: What's your name? (text input)
- Question 2: What's your monthly income in your local currency? (text input)
- Question 3: What do you spend most money on? (selection options: Food, Transport, Data/Airtime, Rent, Entertainment)
- Question 4: What's your biggest financial goal? (selection options: Save more money, Get out of debt, Start a business, Understand money better)
- After completing all questions, redirect user to the chat screen
- Display a personalized welcome message using the user's name on the chat screen

### 2.3 AI Chat Interface
- Sleek, conversational chat interface for interacting with AI financial coach
- Real-time messaging experience
- User-friendly input area for questions and financial queries
- Chat history display: Show all previous conversations between the user and AI coach, persisting across sessions
- Personalized welcome message incorporating user's name from onboarding
- Integrate Featherless AI API for chat functionality:
  - Base URL: https://api.featherless.ai/v1
  - API format: OpenAI API format
  - Model: meta-llama/Llama-3.3-70B-Instruct
  - API key: Store as environment variable FEATHERLESS_API_KEY
  - System prompt: You are CashWise AI, a smart and empathetic financial coach for young Africans. You have deep knowledge of personal finance, African financial tools like M-Pesa, SACCOs, mobile money and local markets. Always use common financial sense — prioritize essential bills like rent over personal debts. When comparing investments present options fairly and ask about risk tolerance. Be warm, direct and practical. Only answer finance related questions.

### 2.4 Conversation History Page
- Accessible from the main navigation with a chat bubble icon
- Display a list of all past conversations grouped by date:
  - Today
  - Yesterday
  - This Week
  - Older
- Each conversation entry shows:
  - First message as a preview
  - Timestamp
- Clicking any conversation opens the full chat history for that session
- New Conversation button to create a fresh chat session
- Delete button for each conversation to remove old conversations
- Consistent green and gold design
- Mobile-friendly responsive layout

### 2.5 Savings Tracker Dashboard
- Accessible from the main navigation
- Goal Setting Section: Allow users to set a savings goal with goal name and target amount in their local currency
- Progress Bar: Display visual progress bar showing how much has been saved towards the goal
- Log Savings Button: Button to log a new savings entry with date and amount
- Savings History List: Simple list showing all past savings entries
- Motivational Message: Dynamic message that updates based on progress (e.g. You're 50% there, keep going! 💪)
- Sample Data for First-Time Users: Display realistic sample data including a savings goal and several savings entries to demonstrate functionality
- Consistent green and gold design
- Mobile-friendly responsive layout

### 2.6 Debt Tracker Page
- Accessible from the main navigation
- Debt Logging Form: Form to log a new debt with the following fields:
  - Who you owe (text input)
  - Amount in local currency (text input)
  - Due date (date picker)
  - Reason (text input, e.g. borrowed for rent)
- Debt List: Display all logged debts showing:
  - Who you owe
  - Amount
  - Due date
  - Status (Unpaid/Paid)
- Mark as Paid Button: Button for each debt to mark it as paid, which moves it to the Cleared Debts section
- Cleared Debts Section: Separate section displaying all debts marked as paid
- Total Amount Owed Counter: Display total amount owed at the top in bold red
- Motivational Message: When all debts are cleared, display message: You're debt free! 🎉 Keep it up!
- Sample Data for First-Time Users: Display realistic sample debt entries to demonstrate functionality
- Consistent green and gold design
- Mobile-friendly responsive layout

### 2.7 Expense Tracker Page
- Accessible from the main navigation
- Expense Logging Form: Form to log daily expenses with the following fields:
  - Category (dropdown selection: Food, Transport, Data/Airtime, Rent, Entertainment, Other)
  - Amount in local currency (text input)
  - Date (date picker)
  - Short note (text input)
- Expense List: Display all logged expenses showing category, amount, date, and note
- Monthly Summary Section:
  - Monthly total per category
  - Grand total spent this month
  - Budget comparison showing if user is over or under budget based on their onboarding income
- Sample Data for First-Time Users: Display realistic sample expense entries across different categories to demonstrate functionality
- Consistent green and gold design
- Mobile-friendly responsive layout

### 2.8 UI Polish Requirements
- Ensure all pages load without errors
- Navigation icons must be clear and labeled
- All buttons must be consistent in green and gold color scheme
- Ensure the app looks perfect on mobile screen sizes
- Fix any broken layouts or overlapping elements
- Maintain consistent spacing and alignment across all pages
- Ensure touch targets are appropriately sized for mobile interaction

## 3. Design Requirements

### 3.1 Design Style
- Modern, premium fintech aesthetic (comparable to Cowrywise or Chipper Cash)
- Human, warm and trustworthy feel
- Avoid generic or corporate appearance

### 3.2 Color Palette
- Primary: Deep green
- Accent: Gold
- Background: White space for clean, modern look
- Consistent color scheme across homepage, onboarding flow, chat interface, conversation history page, savings tracker dashboard, debt tracker page, and expense tracker page

### 3.3 Responsive Design
- Mobile-first approach
- Optimized for all screen sizes