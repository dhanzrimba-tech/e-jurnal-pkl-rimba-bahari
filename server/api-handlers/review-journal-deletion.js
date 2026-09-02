import {
  allowPostOnly,
  parseBody,
  publicError,
  requireActiveUser,
  sendJson,
} from './_supabase.js';

function validUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(req, res) {
  if (!allowPostOnly(req, res)) return;

  try {
    const body = parseBody(req);
    const requestId = String(body.request_id || '').trim();
    const decision = String(body.decision || '').trim();
    const reviewNote = String(body.review_note || '').trim();

    if (!validUuid(requestId)) return sendJson(res, 400, { error: 'ID permintaan tidak valid.' });
    if (!['approved', 'rejected'].includes(decision)) return sendJson(res, 400, { error: 'Keputusan tidak valid.' });
    if (reviewNote.length < 5) return sendJson(res, 400, { error: 'Catatan guru minimal 5 karakter.' });
    if (reviewNote.length > 1000) return sendJson(res, 400, { error: 'Catatan guru maksimal 1000 karakter.' });

    const { admin, actor } = await requireActiveUser(req, ['teacher']);
    const { data: deletionRequest, error: requestError } = await admin
      .from('journal_deletion_requests')
      .select('id,journal_id,teacher_id,status,photo_paths')
      .eq('id', requestId)
      .single();
    if (requestError || !deletionRequest) return sendJson(res, 404, { error: 'Permintaan penghapusan tidak ditemukan.' });
    if (deletionRequest.teacher_id !== actor.id) {
      return sendJson(res, 403, { error: 'Permintaan ini bukan untuk guru pembimbing yang sedang login.' });
    }
    if (deletionRequest.status !== 'pending') {
      return sendJson(res, 409, { error: 'Permintaan ini sudah pernah diproses.' });
    }

    if (decision === 'rejected') {
      const { data: updated, error: updateError } = await admin
        .from('journal_deletion_requests')
        .update({
          status: 'rejected',
          review_note: reviewNote,
          reviewed_by: actor.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('teacher_id', actor.id)
        .eq('status', 'pending')
        .select('id')
        .single();
      if (updateError || !updated) throw updateError || new Error('Permintaan gagal ditolak.');
      return sendJson(res, 200, { ok: true, decision: 'rejected' });
    }

    const { data: result, error: rpcError } = await admin.rpc('approve_journal_deletion_request', {
      p_request_id: requestId,
      p_reviewer_id: actor.id,
      p_review_note: reviewNote,
    });
    if (rpcError) throw rpcError;

    const paths = Array.isArray(result?.photo_paths)
      ? result.photo_paths
      : (Array.isArray(deletionRequest.photo_paths) ? deletionRequest.photo_paths : []);
    let warning = null;
    if (paths.length) {
      const { error: storageError } = await admin.storage.from('journal-photos').remove(paths);
      if (storageError) {
        console.error('photo cleanup after approved deletion:', storageError);
        warning = 'Jurnal sudah dihapus, tetapi sebagian berkas foto perlu dibersihkan oleh administrator.';
      }
    }

    return sendJson(res, 200, { ok: true, decision: 'approved', warning });
  } catch (error) {
    console.error('review-journal-deletion:', error);
    return sendJson(res, error.statusCode || 500, { error: publicError(error) });
  }
}
