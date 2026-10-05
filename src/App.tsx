import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AdminLayout, DoctorLayout, PublicLayout, RequireAuth } from './components/Layouts'
import { AuthProvider } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import { NotificationProvider } from './context/NotificationContext'
import Confirmation from './pages/Confirmation'
import Details from './pages/Details'
import Feedback from './pages/Feedback'
import Home from './pages/Home'
import Login from './pages/Login'
import MyAppointments from './pages/MyAppointments'
import Payment from './pages/Payment'
import Register from './pages/Register'
import Schedule from './pages/Schedule'
import Services from './pages/Services'
import AdminAppointments from './pages/admin/Appointments'
import Dashboard from './pages/admin/Dashboard'
import ProvidersServices from './pages/admin/ProvidersServices'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorOverview from './pages/doctor/DoctorOverview'
import DoctorSchedule from './pages/doctor/DoctorSchedule'

function NotFound() {
  return <div className="py-24 text-center text-slate-500">Page not found.</div>
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        richColors
        closeButton
        style={{ '--width': '520px' } as React.CSSProperties}
        toastOptions={{ style: { borderRadius: '1rem', fontFamily: 'inherit', fontSize: '1.0625rem', padding: '1.25rem 1.5rem', gap: '0.875rem' } }}
      />
      <NotificationProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* Step 1 is public; pressing Continue asks guests to log in or register */}
              <Route path="services" element={<Services />} />

              <Route element={<RequireAuth />}>
                <Route path="book/schedule" element={<Schedule />} />
                <Route path="book/details" element={<Details />} />
                <Route path="book/payment" element={<Payment />} />
                <Route path="book/confirmation/:id" element={<Confirmation />} />
                <Route path="my-appointments" element={<MyAppointments />} />
                <Route path="feedback/:id" element={<Feedback />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Old staff login URL now uses the shared login page */}
            <Route path="admin/login" element={<Navigate to="/login" replace />} />
            <Route path="doctor" element={<RequireAuth role="doctor" />}>
              <Route element={<DoctorLayout />}>
                <Route index element={<DoctorOverview />} />
                <Route path="appointments" element={<DoctorAppointments />} />
                <Route path="schedule" element={<DoctorSchedule />} />
              </Route>
            </Route>
            <Route path="admin" element={<RequireAuth role="admin" />}>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="schedule" element={<ProvidersServices />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </BookingProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
