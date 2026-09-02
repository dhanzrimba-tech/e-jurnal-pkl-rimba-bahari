import resetPassword from '../server/api-handlers/reset-password.js';
import registerStudent from '../server/api-handlers/register-student.js';
import registerPublicStudent from '../server/api-handlers/register-public-student.js';
import requestJournalDeletion from '../server/api-handlers/request-journal-deletion.js';
import reviewAccountDeletion from '../server/api-handlers/review-account-deletion.js';
import createRegistrationLink from '../server/api-handlers/create-registration-link.js';
import health from '../server/api-handlers/health.js';
import adminDeleteJournal from '../server/api-handlers/admin-delete-journal.js';
import verifyRegistration from '../server/api-handlers/verify-registration.js';
import deleteUser from '../server/api-handlers/delete-user.js';
import reviewJournalDeletion from '../server/api-handlers/review-journal-deletion.js';
import requestAccountDeletion from '../server/api-handlers/request-account-deletion.js';
import deleteAttendance from '../server/api-handlers/delete-attendance.js';
import createUser from '../server/api-handlers/create-user.js';

const ROUTES = {
  'reset-password': resetPassword,
  'register-student': registerStudent,
  'register-public-student': registerPublicStudent,
  'request-journal-deletion': requestJournalDeletion,
  'review-account-deletion': reviewAccountDeletion,
  'create-registration-link': createRegistrationLink,
  'health': health,
  'admin-delete-journal': adminDeleteJournal,
  'verify-registration': verifyRegistration,
  'delete-user': deleteUser,
  'review-journal-deletion': reviewJournalDeletion,
  'request-account-deletion': requestAccountDeletion,
  'delete-attendance': deleteAttendance,
  'create-user': createUser,
};

function sendJson(res, status, payload) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.json(payload);
}

export default async function handler(req, res) {
  try {
    const rawUrl = req.url || '';
    const pathname = rawUrl.split('?')[0].replace(/^\/+|\/+$/g, '');
    const parts = pathname.split('/');
    const route = parts[0] === 'api' ? parts[1] : '';
    const fn = ROUTES[route];

    if (!fn) {
      return sendJson(res, 404, {
        error: 'Endpoint API tidak ditemukan.',
        code: 'API_ROUTE_NOT_FOUND',
        route: route || null,
      });
    }

    return await fn(req, res);
  } catch (error) {
    console.error('api-dispatcher:', error);
    return sendJson(res, 500, {
      error: 'Terjadi kesalahan pada layanan E-Jurnal.',
      code: 'API_DISPATCHER_ERROR',
    });
  }
}
