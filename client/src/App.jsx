import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/login.jsx'
import Landing from './pages/landing.jsx'
import Question from './components/Question.jsx'
import { questionsConfig } from './data/questionsConfig.js'
import Completion from './pages/completion.jsx'
import Profile from './pages/profile.jsx'
import Calendar from './pages/calendar.jsx'
import Insights from './pages/insights.jsx'
import Rewards from './pages/rewards.jsx'
import Urge from './pages/urge.jsx'
import FocusGame from './pages/focusgame.jsx'
import AppLayout from './components/AppLayout.jsx'
import About from './pages/About.jsx'



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/questionnaire" element={<Question key="questionnaire" questionData={questionsConfig.questionnaire} />} />
        <Route path="/gender" element={<Question key="gender" questionData={questionsConfig.gender} />} />
        <Route path="/smoking-frequency" element={<Question key="smoking-frequency" questionData={questionsConfig['smoking-frequency']} />} />
        <Route path="/smoking-duration" element={<Question key="smoking-duration" questionData={questionsConfig['smoking-duration']} />} />
        <Route path="/smoking-triggers" element={<Question key="smoking-triggers" questionData={questionsConfig['smoking-triggers']} />} />
        <Route path="/smoking-reasons" element={<Question key="smoking-reasons" questionData={questionsConfig['smoking-reasons']} />} />
        <Route path="/stress-smoking" element={<Question key="stress-smoking" questionData={questionsConfig['stress-smoking']} />} />
        <Route path="/quit-attempts" element={<Question key="quit-attempts" questionData={questionsConfig['quit-attempts']} />} />
        <Route path="/current-goal" element={<Question key="current-goal" questionData={questionsConfig['current-goal']} />} />
        <Route path="/completion" element={<Completion />} />

        {/* Authenticated Routes with Global Header */}
        <Route element={<AppLayout />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/urge" element={<Urge />} />
        </Route>

        <Route path="/about" element={<About />} />
        <Route path="/focusgame" element={<FocusGame />} />


      </Routes>
    </BrowserRouter>
  )
}

export default App
