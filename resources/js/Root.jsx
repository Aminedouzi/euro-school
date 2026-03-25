import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import TeacherCourses from './pages/teacher/TeacherCourses';
import CourseCatalog from './pages/student/CourseCatalog';

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
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}
