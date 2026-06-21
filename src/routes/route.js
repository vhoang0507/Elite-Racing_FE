import { createElement } from 'react';
import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';
import SpectatorDashboard from '../components/Spectator';

import Login from '../components/Login';
import Register from '../components/Register';
import VerifyEmail from '../components/VerifyEmail';
import AdminDashboard from '../components/admin/AdminDashboard';
import CreateRefereeAccount from '../components/admin/CreateRefereeAccount';
import CreateTournament from '../components/admin/CreateTournament';
import HorseManagement from '../components/admin/HorseManagement';
import Notifications from '../components/admin/Notifications';
import PredictionManagement from '../components/admin/PredictionManagement';
import RaceManagement from '../components/admin/RaceManagement';
import RegistrationManagement from '../components/admin/RegistrationManagement';
import UserManagement from '../components/admin/UserManagement';
import ValidateResultDetail from '../components/admin/ValidateResultDetail';
import ValidateResults from '../components/admin/ValidateResults';
import JockeyDashboard from '../components/jockey/JockeyDashboard';
import PendingInvitations from '../components/jockey/PendingInvitations';
import AcceptedRaces from '../components/jockey/AcceptedRaces';
import JockeyCalendar from '../components/jockey/JockeyCalendar';
import HorseOwnerDashboard from '../components/HorseOwner/HorseOwnerDashboard';
import MyHorse from '../components/HorseOwner/MyHorse';
import RegisterHorse from '../components/HorseOwner/RegisterHorse';
import MyRegistrations from '../components/HorseOwner/MyRegistrations';
import JockeyAssignment from '../components/HorseOwner/JockeyAssignment';
import HorseOwnerNotifications from '../components/HorseOwner/Notifications';
import SpectatorTournaments from '../components/Spectator/SpectatorTournaments';
import SpectatorPredictions from '../components/Spectator/SpectatorPredictions';
import SpectatorResultReward from '../components/Spectator/SpectatorResultReward';
import SpectatorNotificationsPage from '../components/Spectator/SpectatorNotificationsPage';
import JockeyNotifications from '../components/jockey/JockeyNotifications';
import JockeySetting from '../components/jockey/JockeySetting';
import AssignedPostRace from '../components/referee/AssignedPostRace';
import AssignedPreRace from '../components/referee/AssignedPreRace';
import RefereeAssignedRace from '../components/referee/RefereeAssignedRace';
import RefereeDashboard from '../components/referee/RefereeDashboard';
import RefereeNotifications from '../components/referee/RefereeNotifications';
import RefereeSetting from '../components/referee/RefereeSetting';
import ResultReward from '../components/HorseOwner/ResultReward';
import HorseResultDetail from '../components/HorseOwner/ResultReward/HorseDetail';

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
        path: '/admin/registrations',
        element: createElement(RegistrationManagement),
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
        path: '/admin/referees/create',
        element: createElement(CreateRefereeAccount),
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
    {
        path: '/jockey',
        element: createElement(Navigate, { to: '/jockey/dashboard' }),
    },
    {
        path: '/jockey/dashboard',
        element: createElement(JockeyDashboard),
    },
    {
        path: '/jockey/invitations',
        element: createElement(PendingInvitations),
    },
    {
        path: '/jockey/accepted',
        element: createElement(AcceptedRaces),
    },
    {
        path: '/jockey/schedule',
        element: createElement(JockeyCalendar),
    }, {
        path: '/jockey/notifications',
        element: createElement(JockeyNotifications),
    },
    {
        path: '/jockey/settings',
        element: createElement(JockeySetting),
    },
    {
        path: '/referee',
        element: createElement(Navigate, { to: '/referee/dashboard' }),
    },
    {
        path: '/referee/dashboard',
        element: createElement(RefereeDashboard),
    },
    {
        path: '/referee/races',
        element: createElement(RefereeAssignedRace),
    },
    {
        path: '/referee/races/pre-race',
        element: createElement(AssignedPreRace),
    },
    {
        path: '/referee/races/post-race',
        element: createElement(AssignedPostRace),
    },
    {
        path: '/referee/notifications',
        element: createElement(RefereeNotifications),
    },
    {
        path: '/referee/settings',
        element: createElement(RefereeSetting),
    },
    {
        path: '/owner',
        element: createElement(Navigate, { to: '/owner/my-horse' }),
    },
    {
        path: '/owner/dashboard',
        element: createElement(HorseOwnerDashboard),
    },
    {
        path: '/owner/my-horse',
        element: createElement(MyHorse),
    },
    {
        path: '/owner/register-horse',
        element: createElement(RegisterHorse),
    },
    {
        path: '/owner/registrations',
        element: createElement(MyRegistrations),
    },
    {
        path: '/owner/jockey',
        element: createElement(JockeyAssignment),
    },
    {
        path: '/owner/rewards',
        element: createElement(ResultReward),
    },
    {
        path: '/owner/rewards/:resultId',
        element: createElement(HorseResultDetail),
    },
    {
        path: '/owner/notifications',
        element: createElement(HorseOwnerNotifications),
    },
    {
        path: '/spectator',
        element: createElement(Navigate, { to: '/spectator/dashboard' }),
    },
    {
        path: '/spectator/dashboard',
        element: createElement(SpectatorDashboard),
    },
    {
        path: '/spectator/tournaments',
        element: createElement(SpectatorTournaments),
    },
    {
        path: '/spectator/predictions',
        element: createElement(SpectatorPredictions),
    },
    {
        path: '/spectator/results',
        element: createElement(SpectatorResultReward),
    },
    {
        path: '/spectator/notifications',
        element: createElement(SpectatorNotificationsPage),
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
