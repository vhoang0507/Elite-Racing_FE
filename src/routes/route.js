import { createElement } from 'react';
import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import Login from '../components/Login';
import Register from '../components/Register';
import VerifyEmail from '../components/VerifyEmail';
import AdminDashboard from '../components/admin/AdminDashboard';
import CreateTournament from '../components/admin/CreateTournament';
import HorseManagement from '../components/admin/HorseManagement';
import Notifications from '../components/admin/Notifications';
import PredictionManagement from '../components/admin/PredictionManagement';
import RaceManagement from '../components/admin/RaceManagement';
import UserManagement from '../components/admin/UserManagement';
import ValidateResultDetail from '../components/admin/ValidateResultDetail';
import ValidateResults from '../components/admin/ValidateResults';

const appRoutes = [
    {
        path: '/',
        element: createElement(Navigate, { to: '/login' }),
    },
    {
        path: '/login',
        element: createElement(Login),
    },
    {
        path: '/register',
        element: createElement(Register),
    },
    {
        path: '/verify-email',
        element: createElement(VerifyEmail),
    },
    {
        path: '/admin',
        element: createElement(Navigate, { to: '/admin/dashboard' }),
    },
    {
        path: '/admin/dashboard',
        element: createElement(AdminDashboard),
    },
    {
        path: '/admin/races',
        element: createElement(RaceManagement),
    },
    {
        path: '/admin/predictions',
        element: createElement(PredictionManagement),
    },
    {
        path: '/admin/tournaments/create',
        element: createElement(CreateTournament),
    },
    {
        path: '/admin/users',
        element: createElement(UserManagement),
    },
    {
        path: '/admin/horses',
        element: createElement(HorseManagement),
    },
    {
        path: '/admin/results',
        element: createElement(ValidateResults),
    },
    {
        path: '/admin/results/:resultId',
        element: createElement(ValidateResultDetail),
    },
    {
        path: '/admin/notifications',
        element: createElement(Notifications),
    },
];

function AppRoutes() {
    return createElement(
        Routes,
        null,
        appRoutes.map((route) => createElement(Route, {
            element: route.element,
            key: route.path,
            path: route.path,
        }))
    );
}

export default AppRoutes;
