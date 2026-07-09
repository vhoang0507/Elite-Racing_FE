import { createElement } from 'react';
import {
    Navigate,
    Route,
    Routes,
} from 'react-router-dom';

import ProtectedRoute from '../components/shared/ProtectedRoute';

import HomePage from '../components/Public/HomePage';
import ExploreTournaments from '../components/Public/ExploreTournaments';
import GlobalRankings from '../components/Public/GlobalRankings';

import SpectatorDashboard from '../components/Spectator';
import SpectatorLeaderboard from '../components/Spectator/SpectatorLeaderboard';

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
import AdminProfile from '../components/admin/AdminProfile';
import AdminSystemTime from '../components/admin/AdminSystemTime';
import UserManagement from '../components/admin/UserManagement';
import ValidateResultDetail from '../components/admin/ValidateResultDetail';
import ValidateResults from '../components/admin/ValidateResults';

import JockeyDashboard from '../components/jockey/JockeyDashboard';
import PendingInvitations from '../components/jockey/PendingInvitations';
import AcceptedRaces from '../components/jockey/AcceptedRaces';
import JockeyCalendar from '../components/jockey/JockeyCalendar';
import JockeyNotifications from '../components/jockey/JockeyNotifications';
import JockeySetting from '../components/jockey/JockeySetting';

import HorseOwnerDashboard from '../components/HorseOwner/HorseOwnerDashboard';
import MyHorse from '../components/HorseOwner/MyHorse';
import RegisterHorse from '../components/HorseOwner/RegisterHorse';
import MyRegistrations from '../components/HorseOwner/MyRegistrations';
import JockeyAssignment from '../components/HorseOwner/JockeyAssignment';
import HorseOwnerNotifications from '../components/HorseOwner/Notifications';
import ResultReward from '../components/HorseOwner/ResultReward';
import HorseResultDetail from '../components/HorseOwner/ResultReward/HorseDetail';
import HorseDetail from '../components/HorseOwner/HorseDetail';
import HorseEdit from '../components/HorseOwner/HorseEdit';

import SpectatorTournaments from '../components/Spectator/SpectatorTournaments';
import SpectatorPredictions from '../components/Spectator/SpectatorPredictions';
import SpectatorResultReward from '../components/Spectator/SpectatorResultReward';
import SpectatorNotificationsPage from '../components/Spectator/SpectatorNotificationsPage';
import SpectatorRaceReplay from '../components/Spectator/SpectatorRaceReplay';

import AssignedPostRace from '../components/referee/AssignedPostRace';
import AssignedPreRace from '../components/referee/AssignedPreRace';
import RefereeAssignedRace from '../components/referee/RefereeAssignedRace';
import RefereeDashboard from '../components/referee/RefereeDashboard';
import RefereeNotifications from '../components/referee/RefereeNotifications';
import RefereeSetting from '../components/referee/RefereeSetting';
import PreRaceInspectionRegistry from '../components/referee/PreRaceInspectionRegistry';
import HorseOwnerSetting from '../components/HorseOwner/HorseOwnerSetting';
import SpectatorSetting from '../components/Spectator/SpectatorSetting';

// Wrap a component in ProtectedRoute using createElement (no JSX needed in .js file)
function guard(role, Component) {
    return createElement(ProtectedRoute, { role }, createElement(Component));
}

const appRoutes = [
    // ── Public ──
    { path: '/', element: createElement(HomePage) },
    { path: '/home', element: createElement(HomePage) },
    { path: '/explore-tournaments', element: createElement(ExploreTournaments) },
    { path: '/global-rankings', element: createElement(GlobalRankings) },
    { path: '/login', element: createElement(Login) },
    { path: '/register', element: createElement(Register) },
    { path: '/verify-email', element: createElement(VerifyEmail) },

    // ── Admin ──
    { path: '/admin', element: createElement(Navigate, { to: '/admin/dashboard', replace: true }) },
    { path: '/admin/dashboard', element: guard('Admin', AdminDashboard) },
    { path: '/admin/races', element: guard('Admin', RaceManagement) },
    { path: '/admin/registrations', element: guard('Admin', RegistrationManagement) },
    { path: '/admin/predictions', element: guard('Admin', PredictionManagement) },
    { path: '/admin/tournaments/create', element: guard('Admin', CreateTournament) },
    { path: '/admin/users', element: guard('Admin', UserManagement) },
    { path: '/admin/referees/create', element: guard('Admin', CreateRefereeAccount) },
    { path: '/admin/horses', element: guard('Admin', HorseManagement) },
    { path: '/admin/results', element: guard('Admin', ValidateResults) },
    { path: '/admin/results/:resultId', element: guard('Admin', ValidateResultDetail) },
    { path: '/admin/notifications', element: guard('Admin', Notifications) },
    { path: '/admin/system-time', element: guard('Admin', AdminSystemTime) },
    { path: '/admin/profile', element: guard('Admin', AdminProfile) },

    // ── Jockey ──
    { path: '/jockey', element: createElement(Navigate, { to: '/jockey/dashboard', replace: true }) },
    { path: '/jockey/dashboard', element: guard('Jockey', JockeyDashboard) },
    { path: '/jockey/invitations', element: guard('Jockey', PendingInvitations) },
    { path: '/jockey/accepted', element: guard('Jockey', AcceptedRaces) },
    { path: '/jockey/schedule', element: guard('Jockey', JockeyCalendar) },
    { path: '/jockey/notifications', element: guard('Jockey', JockeyNotifications) },
    { path: '/jockey/settings', element: guard('Jockey', JockeySetting) },

    // ── Referee ──
    { path: '/referee', element: createElement(Navigate, { to: '/referee/dashboard', replace: true }) },
    { path: '/referee/dashboard', element: guard('RaceReferee', RefereeDashboard) },
    { path: '/referee/races', element: guard('RaceReferee', RefereeAssignedRace) },
    { path: '/referee/races/pre-race', element: guard('RaceReferee', AssignedPreRace) },
    { path: '/referee/races/pre-race/:raceId', element: guard('RaceReferee', PreRaceInspectionRegistry) },
    { path: '/referee/races/post-race', element: guard('RaceReferee', AssignedPostRace) },
    { path: '/referee/notifications', element: guard('RaceReferee', RefereeNotifications) },
    { path: '/referee/settings', element: guard('RaceReferee', RefereeSetting) },

    // ── Horse Owner ──
    { path: '/owner', element: createElement(Navigate, { to: '/owner/my-horse', replace: true }) },
    { path: '/owner/dashboard', element: guard('HorseOwner', HorseOwnerDashboard) },
    { path: '/owner/my-horse', element: guard('HorseOwner', MyHorse) },
    { path: '/owner/register-horse', element: guard('HorseOwner', RegisterHorse) },
    { path: '/owner/horses/:horseId', element: guard('HorseOwner', HorseDetail) },
    { path: '/owner/horses/:horseId/edit', element: guard('HorseOwner', HorseEdit) },
    { path: '/owner/registrations', element: guard('HorseOwner', MyRegistrations) },
    { path: '/owner/jockey', element: guard('HorseOwner', JockeyAssignment) },
    { path: '/owner/rewards', element: guard('HorseOwner', ResultReward) },
    { path: '/owner/rewards/:resultId', element: guard('HorseOwner', HorseResultDetail) },
    { path: '/owner/notifications', element: guard('HorseOwner', HorseOwnerNotifications) },
    { path: '/owner/settings', element: guard('HorseOwner', HorseOwnerSetting) },

    // ── Spectator ──
    { path: '/spectator', element: createElement(Navigate, { to: '/spectator/dashboard', replace: true }) },
    { path: '/spectator/dashboard', element: guard('Spectator', SpectatorDashboard) },
    { path: '/spectator/tournaments', element: guard('Spectator', SpectatorTournaments) },
    { path: '/spectator/leaderboard', element: guard('Spectator', SpectatorLeaderboard) },
    { path: '/spectator/predictions', element: guard('Spectator', SpectatorPredictions) },
    { path: '/spectator/results', element: guard('Spectator', SpectatorResultReward) },
    { path: '/spectator/notifications', element: guard('Spectator', SpectatorNotificationsPage) },
    { path: '/spectator/settings', element: guard('Spectator', SpectatorSetting) },
    { path: '/spectator/races/:raceId/replay', element: guard('Spectator', SpectatorRaceReplay) },
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
