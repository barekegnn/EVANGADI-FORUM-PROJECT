import { useMemo } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import RequestResetPage from "./pages/auth/RequestResetPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";
import QuestionsListPage from "./pages/questions/QuestionsListPage.jsx";
import QuestionDetailPage from "./pages/questions/QuestionDetailPage.jsx";
import AskQuestionPage from "./pages/questions/AskQuestionPage.jsx";
import EditQuestionPage from "./pages/questions/EditQuestionPage.jsx";
import ProfilePage from "./pages/profile/ProfilePage.jsx";
import NotificationPreferencesPage from "./pages/profile/NotificationPreferencesPage.jsx";
import ExpertiseTagsPage from "./pages/profile/ExpertiseTagsPage.jsx";
import NotificationsPage from "./pages/notifications/NotificationsPage.jsx";

export default function App() {
	const isAuthed = useMemo(() => !!localStorage.getItem("token"), []);

	return (
		<Routes>
			<Route element={<Layout />}> 
				<Route index element={<QuestionsListPage />} />
				<Route path="questions/:id" element={<QuestionDetailPage />} />
				<Route path="ask" element={isAuthed ? <AskQuestionPage /> : <Navigate to="/login" replace />} />
				<Route path="questions/:id/edit" element={isAuthed ? <EditQuestionPage /> : <Navigate to="/login" replace />} />
				<Route path="profile" element={isAuthed ? <ProfilePage /> : <Navigate to="/login" replace />} />
				<Route path="profile/notifications" element={isAuthed ? <NotificationPreferencesPage /> : <Navigate to="/login" replace />} />
				<Route path="profile/expertise" element={isAuthed ? <ExpertiseTagsPage /> : <Navigate to="/login" replace />} />
				<Route path="notifications" element={isAuthed ? <NotificationsPage /> : <Navigate to="/login" replace />} />
			</Route>

			<Route path="/login" element={<LoginPage />} />
			<Route path="/register" element={<RegisterPage />} />
			<Route path="/request-password-reset" element={<RequestResetPage />} />
			<Route path="/reset-password" element={<ResetPasswordPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

