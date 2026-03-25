import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import AdminStudentsList from './pages/admin/StudentsList';
import AdminTeachersList from './pages/admin/TeachersList';
import CoursesList from './pages/admin/CoursesList';
import PaymentsList from './pages/admin/PaymentsList';
import InvoicesList from './pages/admin/InvoicesList';
import SubscriptionsList from './pages/admin/SubscriptionsList';
import SchoolsList from './pages/admin/SchoolsList';
import SchoolExpenses from './pages/admin/SchoolExpenses';
import SecretaryCourses from './pages/secretary/SecretaryCourses';
import SecretaryStudentsList from './pages/secretary/StudentsList';
import TeacherCourses from './pages/teacher/TeacherCourses';
import CourseCatalog from './pages/student/CourseCatalog';
import CourseCalendar from './pages/CourseCalendar';

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="calendar" element={<CourseCalendar />} />
                <Route
                    path="admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/users"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <UsersList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/students"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminStudentsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/teachers"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminTeachersList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/courses"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <CoursesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/payments"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <PaymentsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/invoices"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <InvoicesList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/subscriptions"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SubscriptionsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/schools"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SchoolsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/school-expenses"
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <SchoolExpenses />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="secretary/courses"
                    element={
                        <ProtectedRoute allowedRoles={['secretary']}>
                            <SecretaryCourses />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="secretary/students"
                    element={
                        <ProtectedRoute allowedRoles={['secretary']}>
                            <SecretaryStudentsList />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="teacher/courses"
                    element={
                        <ProtectedRoute allowedRoles={['teacher']}>
                            <TeacherCourses />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="student/catalog"
                    element={
                        <ProtectedRoute allowedRoles={['student']}>
                            <CourseCatalog />
                        </ProtectedRoute>
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

export default function Root() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}
