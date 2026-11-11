export interface ConsentLogEntry {
  consentId: string;
  userId: string;
  userName: string;
  ipAddress: string;
  date: string; // YYYY-MM-DD or DD/MM/YYYY
  time: string; // HH:MM:SS
  policyVersion: string;
  consentedPolicies: Array<'الخصوصية' | 'الشروط' | 'معالجة البيانات'>;
  userAgentSummary: string;
  verificationHash: string;
}

export interface AuditLogEntry {
  auditId: string;
  userId: string;
  actorName: string; // من؟
  date: string; // متى؟ (التاريخ)
  time: string; // متى؟ (الوقت)
  moduleName: string;
  actionLabel: string; // ماذا عدّل؟
  oldValue: string; // ما القيمة القديمة؟
  newValue: string; // ما القيمة الجديدة؟
  summarySentence: string; // مثال: قام المستخدم أحمد بتاريخ 10/11/2026 بتعديل الرقم الضريبي.
}

const CONSENT_STORAGE_KEY = 'jo_saas_consent_logs_v1';
const AUDIT_STORAGE_KEY = 'jo_saas_audit_logs_v1';
const GOVERNANCE_EVENT = 'jo-governance-updated';

const INITIAL_CONSENT_LOGS: ConsentLogEntry[] = [
  {
    consentId: 'CNS-2026-1001',
    userId: 'USR-JO-982104',
    userName: 'أحمد عبدالكريم العبدالله',
    ipAddress: '176.29.142.88',
    date: '10/11/2026',
    time: '09:12:04',
    policyVersion: 'v2.4-2026.11',
    consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
    userAgentSummary: 'Chrome 131.0 / Windows 11 (Amman, JO)',
    verificationHash: '8f4b2e91c7d03a65182940fabc9182736450192837465fabc102938475612a9c',
  },
  {
    consentId: 'CNS-2026-1002',
    userId: 'USR-JO-774120',
    userName: 'سارة محمود الكيلاني',
    ipAddress: '94.249.68.114',
    date: '10/11/2026',
    time: '10:05:41',
    policyVersion: 'v2.4-2026.11',
    consentedPolicies: ['الخصوصية', 'الشروط', 'معالجة البيانات'],
    userAgentSummary: 'Safari 18.1 / macOS (Amman, JO)',
    verificationHash: '3d9a1c84e2b70f516273849501a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    auditId: 'AUD-2026-5001',
    userId: 'USR-JO-982104',
    actorName: 'أحمد',
    date: '10/11/2026',
    time: '09:40:15',
    moduleName: 'الملف الضريبي للمنشأة',
    actionLabel: 'تعديل الرقم الضريبي',
    oldValue: '2001584900',
    newValue: '2001584920',
    summarySentence: 'قام المستخدم أحمد بتاريخ 10/11/2026 بتعديل الرقم الضريبي.',
  },
  {
    auditId: 'AUD-2026-5002',
    userId: 'USR-JO-982104',
    actorName: 'أحمد',
    date: '10/11/2026',
    time: '10:14:22',
    moduleName: 'بيانات المفوض بالتوقيع',
    actionLabel: 'تعديل رقم وثيقة التفويض',
    oldValue: 'AUTH-JO-2025-118',
    newValue: 'AUTH-JO-2026-441',
    summarySentence: 'قام المستخدم أحمد بتاريخ 10/11/2026 بتعديل رقم وثيقة التفويض.',
  },
  {
    auditId: 'AUD-2026-5003',
    userId: 'USR-JO-774120',
    actorName: 'سارة (مدير مالي)',
    date: '10/11/2026',
    time: '11:02:50',
    moduleName: 'إقرار ضريبة المبيعات الربعي',
    actionLabel: 'تعديل رصيد ضريبة المدخلات المدور',
    oldValue: '350.000 د.أ',
    newValue: '420.000 د.أ',
    summarySentence: 'قام المستخدم سارة (مدير مالي) بتاريخ 10/11/2026 بتعديل رصيد ضريبة المدخلات المدور.',
  },
];

function formatDateDdMmYyyy(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatTimeHhMmSs(d: Date): string {
  const hrs = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
}

function simpleDeterministicHex(input: string): string {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${part1}${part2}${part1}${part2}${part1}${part2}${part1}${part2}`;
}

export class SystemGovernanceService {
  static getConsentLogs(): ConsentLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_CONSENT_LOGS;
    try {
      const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(INITIAL_CONSENT_LOGS));
        return INITIAL_CONSENT_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_CONSENT_LOGS;
    }
  }

  static recordConsent(params: {
    userId?: string;
    userName?: string;
    ipAddress?: string;
    policyVersion?: string;
    consentedPolicies?: Array<'الخصوصية' | 'الشروط' | 'معالجة البيانات'>;
  }): ConsentLogEntry {
    const now = new Date();
    const dateStr = formatDateDdMmYyyy(now);
    const timeStr = formatTimeHhMmSs(now);
    const userId = params.userId?.trim() || 'USR-JO-982104';
    const userName = params.userName?.trim() || 'أحمد عبدالكريم العبدالله';
    const ipAddress = params.ipAddress?.trim() || '176.29.142.88';
    const policyVersion = params.policyVersion?.trim() || 'v2.4-2026.11';
    const consentedPolicies = params.consentedPolicies || ['الخصوصية', 'الشروط', 'معالجة البيانات'];

    const payload = `${userId}|${ipAddress}|${dateStr}|${timeStr}|${policyVersion}|${consentedPolicies.join(',')}`;
    const entry: ConsentLogEntry = {
      consentId: `CNS-${Date.now().toString().slice(-6)}`,
      userId,
      userName,
      ipAddress,
      date: dateStr,
      time: timeStr,
      policyVersion,
      consentedPolicies,
      userAgentSummary: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 56) : 'Web Browser Client (JO)',
      verificationHash: simpleDeterministicHex(payload),
    };

    const current = this.getConsentLogs();
    const updated = [entry, ...current];
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(GOVERNANCE_EVENT));
    } catch {
      // ignore storage errors
    }
    return entry;
  }

  static getAuditLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS;
      }
      return JSON.parse(raw);
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  static recordAuditAction(params: {
    userId?: string;
    actorName: string;
    actorRole?: string;
    moduleName: string;
    actionLabel: string;
    oldValue: string;
    newValue: string;
    customDate?: string;
  }): AuditLogEntry {
    const now = new Date();
    const dateStr = params.customDate || formatDateDdMmYyyy(now);
    const timeStr = formatTimeHhMmSs(now);
    const actor = params.actorName.trim() || 'أحمد';
    const action = params.actionLabel.trim() || 'تعديل بيانات السجل';

    const entry: AuditLogEntry = {
      auditId: `AUD-${Date.now().toString().slice(-6)}`,
      userId: params.userId?.trim() || 'USR-JO-982104',
      actorName: actor,
      date: dateStr,
      time: timeStr,
      moduleName: params.moduleName.trim() || 'النظام المحاسبي',
      actionLabel: action,
      oldValue: params.oldValue,
      newValue: params.newValue,
      summarySentence: `قام المستخدم ${actor} بتاريخ ${dateStr} ب${action.startsWith('تعديل') || action.startsWith('إضافة') || action.startsWith('حذف') || action.startsWith('اعتماد') ? action : `تعديل ${action}`}.`,
    };

    const current = this.getAuditLogs();
    const updated = [entry, ...current];
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(GOVERNANCE_EVENT));
    } catch {
      // ignore storage errors
    }
    return entry;
  }

  static subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(GOVERNANCE_EVENT, callback);
    return () => window.removeEventListener(GOVERNANCE_EVENT, callback);
  }
}
