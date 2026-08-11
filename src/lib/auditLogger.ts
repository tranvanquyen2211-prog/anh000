import { supabase } from './supabase';
import type { AuditLog } from '../types';

/**
 * Record a new system audit log event continuously across LocalStorage and Supabase Realtime WebSocket Cloud DB.
 */
export const recordAuditLog = async (
  actorName: string,
  actorRole: 'SUPER_ADMIN' | 'SHOP' | 'STAFF' | 'USER' | 'SYSTEM',
  action: string,
  target: string,
  details: string,
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'INFO'
): Promise<AuditLog> => {
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    actorName,
    actorRole,
    action,
    target,
    details,
    ipAddress: 'Client Session',
    timestamp: new Date().toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    severity
  };

  // 1. Save to LocalStorage
  try {
    const existing: AuditLog[] = JSON.parse(localStorage.getItem('tq_audit_logs') || '[]');
    const updated = [newLog, ...existing].slice(0, 300); // keep up to 300 recent logs
    localStorage.setItem('tq_audit_logs', JSON.stringify(updated));
  } catch (e) {
    console.warn('Local audit log storage save error:', e);
  }

  // 2. Dispatch Local Window Custom Event for active UI components
  window.dispatchEvent(new CustomEvent('tq_audit_log_created', { detail: newLog }));

  // 3. Broadcast Realtime WebSocket Event to all active clients
  try {
    supabase.channel('public:audit_logs').send({
      type: 'broadcast',
      event: 'new_audit_log',
      payload: newLog
    });
  } catch (e) {
    console.warn('Realtime audit log broadcast active');
  }

  // 4. Async sync to Supabase Cloud DB table 'audit_logs'
  try {
    await supabase.from('audit_logs').upsert([
      {
        id: newLog.id,
        actor_name: newLog.actorName,
        actor_role: newLog.actorRole,
        action: newLog.action,
        target: newLog.target,
        details: newLog.details,
        ip_address: newLog.ipAddress,
        timestamp: newLog.timestamp,
        severity: newLog.severity
      }
    ]);
  } catch (e) {
    console.warn('Cloud audit logs table upsert active');
  }

  return newLog;
};

/**
 * Get sorted audit logs from LocalStorage
 */
export const getAuditLogs = (): AuditLog[] => {
  try {
    const saved = localStorage.getItem('tq_audit_logs');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};
