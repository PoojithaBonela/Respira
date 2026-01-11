export const questionsConfig = {
  questionnaire: {
    id: 'questionnaire',
    title: '1. What\'s your age range?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/gender',
    backRoute: '/landing',
    options: [
      { id: '18-24', label: '18–24' },
      { id: '25-34', label: '25–34' },
      { id: '35-44', label: '35–44' },
      { id: '45+', label: '45 or above' }
    ]
  },
  gender: {
    id: 'gender',
    title: '2. Gender',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/smoking-frequency',
    backRoute: '/questionnaire',
    options: [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'prefer-not', label: 'Prefer not to say' }
    ]
  },
  'smoking-frequency': {
    id: 'smoking-frequency',
    title: '3. On average, how many cigarettes do you smoke per day?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/smoking-duration',
    backRoute: '/gender',
    options: [
      { id: '1-5', label: '1–5' },
      { id: '6-10', label: '6–10' },
      { id: '11-20', label: '11–20' },
      { id: '20+', label: 'More than 20' }
    ]
  },
  'smoking-duration': {
    id: 'smoking-duration',
    title: '4. How long have you been smoking?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/smoking-triggers',
    backRoute: '/smoking-frequency',
    options: [
      { id: 'less-1', label: 'Less than 1 year' },
      { id: '1-3', label: '1–3 years' },
      { id: '3-5', label: '3–5 years' },
      { id: '5+', label: 'More than 5 years' }
    ]
  },
  'smoking-triggers': {
    id: 'smoking-triggers',
    title: '5. When do you usually feel the urge to smoke the most?',
    subtitle: '(You can select multiple)',
    type: 'checkbox',
    nextRoute: '/smoking-reasons',
    backRoute: '/smoking-duration',
    options: [
      { id: 'morning', label: 'Morning' },
      { id: 'after-meals', label: 'After meals' },
      { id: 'work-study', label: 'During work or study' },
      { id: 'evening-night', label: 'Evening / night' },
      { id: 'social', label: 'Social situations' }
    ]
  },
  'smoking-reasons': {
    id: 'smoking-reasons',
    title: '6. What are your main reasons for smoking?',
    subtitle: '(You can select multiple)',
    type: 'checkbox',
    nextRoute: '/stress-smoking',
    backRoute: '/smoking-triggers',
    options: [
      { id: 'stress', label: 'Stress' },
      { id: 'boredom', label: 'Boredom' },
      { id: 'anxiety', label: 'Anxiety' },
      { id: 'social-pressure', label: 'Social pressure' },
      { id: 'habit-routine', label: 'Habit / routine' }
    ]
  },
  'stress-smoking': {
    id: 'stress-smoking',
    title: '7. Do you smoke more when stressed?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/quit-attempts',
    backRoute: '/smoking-reasons',
    options: [
      { id: 'yes', label: 'Yes' },
      { id: 'no', label: 'No' },
      { id: 'sometimes', label: 'Sometimes' }
    ]
  },
  'quit-attempts': {
    id: 'quit-attempts',
    title: '8. How many times have you tried to quit?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/current-goal',
    backRoute: '/stress-smoking',
    options: [
      { id: 'never', label: 'Never tried' },
      { id: 'once', label: 'Once' },
      { id: '2-3', label: '2–3 times' },
      { id: '4+', label: '4 or more times' }
    ]
  },
  'current-goal': {
    id: 'current-goal',
    title: '9. What is your current quit goal?',
    subtitle: '(Select one)',
    type: 'radio',
    nextRoute: '/completion',
    backRoute: '/quit-attempts',
    options: [
      { id: 'quit-completely', label: 'Quit completely' },
      { id: 'reduce-significantly', label: 'Reduce significantly' },
      { id: 'reduce-moderately', label: 'Reduce moderately' },
      { id: 'just-explore', label: 'Just exploring options' }
    ]
  }
}
