import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import WorkshopsPage from './pages/WorkshopsPage'
import WorkshopDetailPage from './pages/WorkshopDetailPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import AdminPage from './pages/AdminPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="workshops" element={<WorkshopsPage />} />
            <Route path="workshops/:id" element={<WorkshopDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
