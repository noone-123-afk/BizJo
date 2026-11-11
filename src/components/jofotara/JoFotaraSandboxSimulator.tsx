import React, { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import { QRCodeSVG } from 'qrcode.react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Cpu,
  Send,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  QrCode,
  Binary,
} from 'lucide-react';
import { TlvQrGenerator, DecodedTlvTag } from '../../services/jofotara/TlvQrGenerator';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export type SandboxHttpStatus = 200 | 400 | 401 | 422;

export interface SandboxAuditReport {
  httpStatus: SandboxHttpStatus;
  statusText: string;
  statusTitleAr: string;
  isApproved: boolean;
  clearanceSerialNo: string | null;
  clearanceUuid: string | null;
  responseTimestamp: string;
  sha256Check: {
    isValid: boolean;
    computedSha256: string;
    submittedSha256: string;
    canonicalString: string;
  };
  tlvCheck: {
    isValid: boolean;
    presentTagsCount: number;
    missingTags: number[];
    decodedTags: DecodedTlvTag[];
    errorDetail: string | null;
  };
  authCheck: {
    isValid: boolean;
    errorDetail: string | null;
  };
  taxMathCheck: {
    isValid: boolean;
    netAmountJod: string;
    expectedTaxJod: string;
    submittedTaxJod: string;
    taxVarianceFils: string;
    expectedTotalJod: string;
    submittedTotalJod: string;
    errorDetail: string | null;
  };
  rawGovernmentJsonResponse: string;
}

const VALID_SANDBOX_CLIENT_ID = 'ISTD-SBX-CLIENT-2026';
const VALID_SANDBOX_SECRET_KEY = 'JO-FOTARA-CERT-SHA256-KEY-9981';

async function computeSha256Hex(payload: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const data = new TextEncoder().encode(payload);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    h ^= payload.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(64, 'a');
}

function safeDec(v: number | string): Decimal {
  try {
    const d = new Decimal(v || 0);
    return d.isFinite() ? d : new Decimal(0);
  } catch {
    return new Decimal(0);
  }
}

export default function JoFotaraSandboxSimulator() {
  // Sandbox API Credentials
  const [clientId, setClientId] = useState<string>(VALID_SANDBOX_CLIENT_ID);
  const [secretKey, setSecretKey] = useState<string>(VALID_SANDBOX_SECRET_KEY);

  // Invoice Core Fields
  const [sellerName, setSellerName] = useState<string>('شركة الرواد للصناعات والتجارة ذ.م.م');
  const [sellerTin, setSellerTin] = useState<string>('2001584920');
  const [invoiceNo, setInvoiceNo] = useState<string>('INV-SBX-2026-0915');
  const [invoiceDate, setInvoiceDate] = useState<string>('2026-11-10T10:30:00Z');
  const [netAmountStr, setNetAmountStr] = useState<string>('1250.000');
  const [taxRatePct, setTaxRatePct] = useState<number>(16);
  const [submittedTaxStr, setSubmittedTaxStr] = useState<string>('200.000');
  const [submittedTotalStr, setSubmittedTotalStr] = useState<string>('1450.000');

  // Cryptographic Signature & TLV Base64 Payload
  const [computedCanonicalSha256, setComputedCanonicalSha256] = useState<string>('');
  const [submittedSha256, setSubmittedSha256] = useState<string>('');
  const [tlvBase64Input, setTlvBase64Input] = useState<string>('');
  const [autoSyncTlvAndHash, setAutoSyncTlvAndHash] = useState<boolean>(true);

  const [sandboxReport, setSandboxReport] = useState<SandboxAuditReport | null>(null);

  const buildCanonicalPayload = (
    tin: string,
    invNo: string,
    dateStr: string,
    net: string,
    tax: string,
    total: string
  ) => {
    const netDec = safeDec(net).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const taxDec = safeDec(tax).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const totalDec = safeDec(total).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    return `${tin.trim()}|${invNo.trim()}|${dateStr.trim()}|${netDec.toFixed(3)}|${taxDec.toFixed(3)}|${totalDec.toFixed(3)}`;
  };

  const runLiveSandboxInspection = async (
    overrideParams?: Partial<{
      cId: string;
      sKey: string;
      sName: string;
      sTin: string;
      invNo: string;
      invDate: string;
      netStr: string;
      ratePct: number;
      subTaxStr: string;
      subTotStr: string;
      subHash: string;
      tlvB64: string;
      syncMode: boolean;
    }>
  ) => {
    const cId = overrideParams?.cId ?? clientId;
    const sKey = overrideParams?.sKey ?? secretKey;
    const sName = overrideParams?.sName ?? sellerName;
    const sTin = overrideParams?.sTin ?? sellerTin;
    const invNo = overrideParams?.invNo ?? invoiceNo;
    const invDate = overrideParams?.invDate ?? invoiceDate;
    const netStr = overrideParams?.netStr ?? netAmountStr;
    const ratePct = overrideParams?.ratePct ?? taxRatePct;
    const subTaxStr = overrideParams?.subTaxStr ?? submittedTaxStr;
    const subTotStr = overrideParams?.subTotStr ?? submittedTotalStr;
    const syncMode = overrideParams?.syncMode ?? autoSyncTlvAndHash;

    const netDec = safeDec(netStr).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const rateDec = safeDec(ratePct).div(100);
    const expectedTaxDec = netDec.times(rateDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const expectedTotalDec = netDec.plus(expectedTaxDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

    const subTaxDec = safeDec(subTaxStr).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
    const subTotDec = safeDec(subTotStr).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);

    // 1. Compute canonical SHA-256 from true invoice parameters
    const canonicalString = buildCanonicalPayload(
      sTin,
      invNo,
      invDate,
      netDec.toFixed(3),
      expectedTaxDec.toFixed(3),
      expectedTotalDec.toFixed(3)
    );
    const trueSha256 = await computeSha256Hex(canonicalString);
    setComputedCanonicalSha256(trueSha256);

    let activeSubHash = overrideParams?.subHash ?? submittedSha256;
    let activeTlvB64 = overrideParams?.tlvB64 ?? tlvBase64Input;

    if (syncMode && !overrideParams?.subHash && !overrideParams?.tlvB64) {
      activeSubHash = trueSha256;
      setSubmittedSha256(trueSha256);
      activeTlvB64 = TlvQrGenerator.generateJoFotaraQrBase64({
        sellerCommercialName: sName,
        sellerTaxNumber: sTin,
        invoiceTimestamp: invDate,
        invoiceGrandTotal: subTotDec.toFixed(3),
        taxTotalAmount: subTaxDec.toFixed(3),
        digitalHash: trueSha256,
      });
      setTlvBase64Input(activeTlvB64);
    }

    // 2. Check Authentication (401 Unauthorized)
    const isAuthValid =
      cId.trim() === VALID_SANDBOX_CLIENT_ID && sKey.trim() === VALID_SANDBOX_SECRET_KEY;
    const authError = isAuthValid
      ? null
      : 'فشل المصادقة الرقمية (401 Unauthorized): مفتاح الربط Client-Id أو شهادة التوقيع السرية Secret-Key غير مطابقة لخوادم ISTD.';

    // 3. Check TLV Base64 Structure & Mandatory 6 Tags (400 Bad Request)
    const decodedTags = TlvQrGenerator.decodeTlvBase64(activeTlvB64);
    const requiredTags = [1, 2, 3, 4, 5, 6];
    const presentTagNumbers = decodedTags.map((t) => t.tag);
    const missingTags = requiredTags.filter((reqTag) => !presentTagNumbers.includes(reqTag));
    const hasEmptyTagValue = decodedTags.some(
      (t) => requiredTags.includes(t.tag) && (!t.value || t.value.trim().length === 0)
    );
    const isTinValidFormat = /^\d{8,12}$/.test(sTin.trim());

    const isTlvValid =
      activeTlvB64.trim().length > 12 &&
      missingTags.length === 0 &&
      !hasEmptyTagValue &&
      isTinValidFormat;

    let tlvError: string | null = null;
    if (!isTlvValid) {
      if (missingTags.length > 0) {
        tlvError = `خطأ هيكلي في حزمة TLV Base64 (400 Bad Request): الحقول الإلزامية المفقودة رقم [${missingTags.join(', ')}] من أصل الحقول الستة.`;
      } else if (!isTinValidFormat) {
        tlvError = 'خطأ في الرقم الضريبي (Tag 2): يجب أن يتكون الرقم الضريبي للمكلف من 8 إلى 12 رقماً صحيحاً.';
      } else {
        tlvError = 'خطأ في تنسيق سلسلة TLV Base64 أو وجود حقل إلزامي فارغ.';
      }
    }

    // 4. Check Mathematical 3-Decimal Tax Accuracy & SHA-256 Integrity (422 Unprocessable Entity)
    const taxVarianceDec = subTaxDec.minus(expectedTaxDec).abs();
    const totalVarianceDec = subTotDec.minus(expectedTotalDec).abs();
    const isMathValid = taxVarianceDec.eq(0) && totalVarianceDec.eq(0);
    const isSha256Valid = activeSubHash.trim().toLowerCase() === trueSha256.toLowerCase();

    let mathOrHashError: string | null = null;
    if (!isMathValid) {
      mathOrHashError = `عدم تطابق حسابي ضريبي (422 Unprocessable Entity): الضريبة المرسلة (${subTaxDec.toFixed(
        3
      )} د.أ) أو الإجمالي (${subTotDec.toFixed(3)} د.أ) لا يطابق حاصل ضرب الصافي (${netDec.toFixed(
        3
      )} × ${ratePct}% = ${expectedTaxDec.toFixed(3)} د.أ) بدقة 3 خانات عشرية (فرق ${taxVarianceDec.toFixed(
        3
      )} د.أ).`;
    } else if (!isSha256Valid) {
      mathOrHashError =
        'فشل التحقق من بصمة التشفير الرقمية SHA-256 (422 Unprocessable Entity): البصمة المرفقة لا تطابق محتوى الفاتورة الفعلي (شبهة تعديل بعد التوقيع).';
    }

    // 5. Determine Final Government HTTP Status Code Priority
    let httpStatus: SandboxHttpStatus = 200;
    let statusText = '200 OK — Cleared & Signed';
    let statusTitleAr = 'تم التحقق من الفاتورة بنجاح وإصدار الرقم التسلسلي القياسي (200 OK)';

    if (!isAuthValid) {
      httpStatus = 401;
      statusText = '401 Unauthorized — Invalid Certificate / API Key';
      statusTitleAr = 'رفض الاتصال: خطأ في شهادة المصادقة الرقمية أو المفتاح السري (401 Unauthorized)';
    } else if (!isTlvValid) {
      httpStatus = 400;
      statusText = '400 Bad Request — Malformed TLV or Missing Mandatory Tag';
      statusTitleAr = 'رفض هيكلي: خطأ في ترميز TLV Base64 أو نقص حقل إلزامي (400 Bad Request)';
    } else if (!isMathValid || !isSha256Valid) {
      httpStatus = 422;
      statusText = '422 Unprocessable Entity — Tax Math or SHA-256 Mismatch';
      statusTitleAr = 'رفض موضوعي: عدم مطابقة حساب الضريبة (بالفلس) أو بصمة التشفير (422 Unprocessable Entity)';
    }

    const isApproved = httpStatus === 200;
    const clearanceSerialNo = isApproved ? `ISTD-JO-2026-${invNo.replace(/\D/g, '').slice(-4) || '8841'}` : null;
    const clearanceUuid = isApproved ? `9f4c2a10-8e31-4b20-9c77-${trueSha256.slice(0, 12)}` : null;
    const responseTimestamp = new Date().toISOString();

    const govResponsePayload = isApproved
      ? {
          httpStatusCode: 200,
          status: 'CLEARED_AND_STAMPED',
          istdSerialNumber: clearanceSerialNo,
          nationalInvoiceUuid: clearanceUuid,
          clearedAt: responseTimestamp,
          verifiedTlvTagsCount: 6,
          verifiedTaxAmountJod: expectedTaxDec.toFixed(3),
          verifiedGrandTotalJod: expectedTotalDec.toFixed(3),
          cryptographicDigestSha256: trueSha256,
          messageAr: 'تم فحص التوقيع الرقمي وحقول TLV الستة ومطابقة الضريبة بنجاح واعتماد الفاتورة في خوادم ISTD.',
        }
      : {
          httpStatusCode: httpStatus,
          status: 'REJECTED_BY_ISTD_GATEWAY',
          rejectedAt: responseTimestamp,
          errorCode:
            httpStatus === 401
              ? 'ERR_AUTH_INVALID_CREDENTIALS'
              : httpStatus === 400
              ? 'ERR_TLV_STRUCTURAL_VIOLATION'
              : 'ERR_TAX_MATH_OR_HASH_MISMATCH',
          errorDescriptionAr: authError || tlvError || mathOrHashError,
          diagnostics: {
            expectedTaxJod: expectedTaxDec.toFixed(3),
            submittedTaxJod: subTaxDec.toFixed(3),
            expectedSha256Prefix: trueSha256.slice(0, 24),
            submittedSha256Prefix: activeSubHash.slice(0, 24),
            missingTlvTags: missingTags,
          },
        };

    setSandboxReport({
      httpStatus,
      statusText,
      statusTitleAr,
      isApproved,
      clearanceSerialNo,
      clearanceUuid,
      responseTimestamp,
      sha256Check: {
        isValid: isSha256Valid,
        computedSha256: trueSha256,
        submittedSha256: activeSubHash,
        canonicalString,
      },
      tlvCheck: {
        isValid: isTlvValid,
        presentTagsCount: decodedTags.filter((t) => requiredTags.includes(t.tag)).length,
        missingTags,
        decodedTags,
        errorDetail: tlvError,
      },
      authCheck: {
        isValid: isAuthValid,
        errorDetail: authError,
      },
      taxMathCheck: {
        isValid: isMathValid,
        netAmountJod: netDec.toFixed(3),
        expectedTaxJod: expectedTaxDec.toFixed(3),
        submittedTaxJod: subTaxDec.toFixed(3),
        taxVarianceFils: taxVarianceDec.toFixed(3),
        expectedTotalJod: expectedTotalDec.toFixed(3),
        submittedTotalJod: subTotDec.toFixed(3),
        errorDetail: mathOrHashError,
      },
      rawGovernmentJsonResponse: JSON.stringify(govResponsePayload, null, 2),
    });
  };

  useEffect(() => {
    runLiveSandboxInspection();
  }, []);

  // Scenario Triggers for Instant Testing of 200, 400, 401, 422
  const triggerScenario200Ok = async () => {
    const net = '1250.000';
    const rate = 16;
    const tax = '200.000';
    const tot = '1450.000';
    const canonical = buildCanonicalPayload('2001584920', 'INV-SBX-2026-0915', '2026-11-10T10:30:00Z', net, tax, tot);
    const hash = await computeSha256Hex(canonical);
    const validTlv = TlvQrGenerator.generateJoFotaraQrBase64({
      sellerCommercialName: sellerName,
      sellerTaxNumber: '2001584920',
      invoiceTimestamp: '2026-11-10T10:30:00Z',
      invoiceGrandTotal: tot,
      taxTotalAmount: tax,
      digitalHash: hash,
    });

    setClientId(VALID_SANDBOX_CLIENT_ID);
    setSecretKey(VALID_SANDBOX_SECRET_KEY);
    setSellerTin('2001584920');
    setNetAmountStr(net);
    setTaxRatePct(rate);
    setSubmittedTaxStr(tax);
    setSubmittedTotalStr(tot);
    setSubmittedSha256(hash);
    setTlvBase64Input(validTlv);
    setAutoSyncTlvAndHash(true);

    await runLiveSandboxInspection({
      cId: VALID_SANDBOX_CLIENT_ID,
      sKey: VALID_SANDBOX_SECRET_KEY,
      sTin: '2001584920',
      netStr: net,
      ratePct: rate,
      subTaxStr: tax,
      subTotStr: tot,
      subHash: hash,
      tlvB64: validTlv,
      syncMode: true,
    });
  };

  const triggerScenario400BadTlv = async () => {
    // Missing Tags 4, 5, 6 in TLV Base64 (truncated TLV)
    const truncatedTlv = btoa('\x01\x06AlRowd\x02\x0a2001584920');
    setClientId(VALID_SANDBOX_CLIENT_ID);
    setSecretKey(VALID_SANDBOX_SECRET_KEY);
    setAutoSyncTlvAndHash(false);
    setTlvBase64Input(truncatedTlv);

    await runLiveSandboxInspection({
      cId: VALID_SANDBOX_CLIENT_ID,
      sKey: VALID_SANDBOX_SECRET_KEY,
      tlvB64: truncatedTlv,
      syncMode: false,
    });
  };

  const triggerScenario401Unauthorized = async () => {
    const badKey = 'EXPIRED-OR-REVOKED-SECRET-KEY-000';
    setSecretKey(badKey);
    await runLiveSandboxInspection({
      cId: VALID_SANDBOX_CLIENT_ID,
      sKey: badKey,
    });
  };

  const triggerScenario422TaxMismatch = async () => {
    // Net = 1250.000, 16% should be 200.000, but POS sends 195.500 (discrepancy)
    const wrongTax = '195.500';
    const wrongTotal = '1445.500';
    setClientId(VALID_SANDBOX_CLIENT_ID);
    setSecretKey(VALID_SANDBOX_SECRET_KEY);
    setAutoSyncTlvAndHash(false);
    setSubmittedTaxStr(wrongTax);
    setSubmittedTotalStr(wrongTotal);

    await runLiveSandboxInspection({
      cId: VALID_SANDBOX_CLIENT_ID,
      sKey: VALID_SANDBOX_SECRET_KEY,
      subTaxStr: wrongTax,
      subTotStr: wrongTotal,
      syncMode: false,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            بيئة الفحص والربط التجريبي المباشر — دائرة ضريبة الدخل والمبيعات (ISTD Sandbox API Gateway)
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>بوابة محاكاة إرسال الفواتير التجريبية (JoFotara Sandbox Live Simulator)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            فحص التوقيع الرقمي (SHA-256)، تفكيك الحقول الستة الإلزامية لترميز (TLV Base64)، ومحاكاة رموز الاستجابة الحكومية (200، 400، 401، 422) بدقة الفلس الأردني
          </p>
        </div>

        <button
          type="button"
          onClick={() => runLiveSandboxInspection()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0"
        >
          <Send className="w-4 h-4" />
          <span>إرسال وفحص الفاتورة عبر بوابة Sandbox</span>
        </button>
      </div>

      {/* 4 Live HTTP Response Scenario Trigger Bar */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            اختبار سيناريوهات الاستجابة الحكومية الحية (Mock ISTD API Status Codes):
          </span>
          <span className="text-[11px] font-mono text-slate-500">انقر لمحاكاة كل حالة برمجية فوراً</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={triggerScenario200Ok}
            className={`p-3 rounded-xl border text-right transition cursor-pointer ${
              sandboxReport?.httpStatus === 200
                ? 'bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span className="text-emerald-500">HTTP 200 OK</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              اعتماد ناجح (تطابق SHA-256 + 6 حقول TLV + دقة الضريبة)
            </div>
          </button>

          <button
            type="button"
            onClick={triggerScenario400BadTlv}
            className={`p-3 rounded-xl border text-right transition cursor-pointer ${
              sandboxReport?.httpStatus === 400
                ? 'bg-amber-950/20 border-amber-500 text-amber-600 dark:text-amber-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/50'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span className="text-amber-500">HTTP 400 Bad Request</span>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              خطأ هيكلي في ترميز TLV Base64 أو نقص حقل إلزامي
            </div>
          </button>

          <button
            type="button"
            onClick={triggerScenario401Unauthorized}
            className={`p-3 rounded-xl border text-right transition cursor-pointer ${
              sandboxReport?.httpStatus === 401
                ? 'bg-rose-950/20 border-rose-500 text-rose-600 dark:text-rose-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span className="text-rose-500">HTTP 401 Unauthorized</span>
              <KeyRound className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              خطأ في شهادة المصادقة الرقمية أو المفتاح السري للربط
            </div>
          </button>

          <button
            type="button"
            onClick={triggerScenario422TaxMismatch}
            className={`p-3 rounded-xl border text-right transition cursor-pointer ${
              sandboxReport?.httpStatus === 422
                ? 'bg-rose-950/20 border-rose-500 text-rose-600 dark:text-rose-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-500/50'
            }`}
          >
            <div className="flex items-center justify-between font-mono text-xs font-bold mb-1">
              <span className="text-rose-500">HTTP 422 Unprocessable</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
              عدم مطابقة الضريبة (بالفلس) أو تلاعب في بصمة SHA-256
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT 5 COLUMNS: Sandbox Payload & Cryptographic Inputs */}
        <div className="lg:col-span-5 space-y-4">
          {/* API Auth Credentials */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-500" />
              <span>1. مفاتيح وشهادة المصادقة للربط الحكومي (API Headers)</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">معرف العميل (Client-Id)</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">المفتاح السري (Secret-Key)</label>
                <input
                  type="text"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Invoice Financial & Tax Parameters */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              2. بيانات الفاتورة المرسلة من نقطة البيع (POS Payload)
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">الرقم الضريبي للبائع (Tag 2)</label>
                <input
                  type="text"
                  value={sellerTin}
                  onChange={(e) => setSellerTin(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">رقم الفاتورة التسلسلي</label>
                <input
                  type="text"
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">اسم البائع التجاري (Tag 1)</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">صافي الفاتورة قبل الضريبة (د.أ)</label>
                <input
                  type="number"
                  step="0.001"
                  value={netAmountStr}
                  onChange={(e) => {
                    const newNet = e.target.value;
                    setNetAmountStr(newNet);
                    if (autoSyncTlvAndHash) {
                      const nDec = safeDec(newNet);
                      const tDec = nDec.times(new Decimal(taxRatePct).div(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
                      const gDec = nDec.plus(tDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
                      setSubmittedTaxStr(tDec.toFixed(3));
                      setSubmittedTotalStr(gDec.toFixed(3));
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">نسبة ضريبة المبيعات (%)</label>
                <select
                  value={taxRatePct}
                  onChange={(e) => {
                    const newRate = Number(e.target.value);
                    setTaxRatePct(newRate);
                    if (autoSyncTlvAndHash) {
                      const nDec = safeDec(netAmountStr);
                      const tDec = nDec.times(new Decimal(newRate).div(100)).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
                      const gDec = nDec.plus(tDec).toDecimalPlaces(3, Decimal.ROUND_HALF_UP);
                      setSubmittedTaxStr(tDec.toFixed(3));
                      setSubmittedTotalStr(gDec.toFixed(3));
                    }
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                >
                  <option value={16}>16% (النسبة العامة)</option>
                  <option value={10}>10% (نسبة مخفضة)</option>
                  <option value={4}>4% (سلع أساسية)</option>
                  <option value={0}>0% (صفر / معفى)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">قيمة الضريبة المرسلة (Tag 5)</label>
                <input
                  type="number"
                  step="0.001"
                  value={submittedTaxStr}
                  onChange={(e) => {
                    setAutoSyncTlvAndHash(false);
                    setSubmittedTaxStr(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">الإجمالي الشامل المرسل (Tag 4)</label>
                <input
                  type="number"
                  step="0.001"
                  value={submittedTotalStr}
                  onChange={(e) => {
                    setAutoSyncTlvAndHash(false);
                    setSubmittedTotalStr(e.target.value);
                  }}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* SHA-256 & TLV Base64 Inspector Inputs */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                3. التوقيع الرقمي (SHA-256) وحزمة (TLV Base64)
              </span>
              <button
                type="button"
                onClick={triggerScenario200Ok}
                className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>إعادة توليد تلقائي متطابق</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                بصمة التشفير المرسلة مع الفاتورة (SHA-256 Digest)
              </label>
              <input
                type="text"
                dir="ltr"
                value={submittedSha256}
                onChange={(e) => {
                  setAutoSyncTlvAndHash(false);
                  setSubmittedSha256(e.target.value);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                سلسلة ترميز رمز الاستجابة السريع (TLV Base64 Payload)
              </label>
              <textarea
                rows={2}
                dir="ltr"
                value={tlvBase64Input}
                onChange={(e) => {
                  setAutoSyncTlvAndHash(false);
                  setTlvBase64Input(e.target.value);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* RIGHT 7 COLUMNS: Live Diagnostic Results & TLV Tag Decoder */}
        {sandboxReport && (
          <div className="lg:col-span-7 space-y-5">
            {/* HTTP Status Banner */}
            <div
              className={`p-5 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                sandboxReport.httpStatus === 200
                  ? 'bg-emerald-950/15 border-emerald-600/50'
                  : sandboxReport.httpStatus === 400
                  ? 'bg-amber-950/15 border-amber-600/50'
                  : 'bg-rose-950/15 border-rose-600/50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-sm font-extrabold px-2.5 py-0.5 rounded-md ${
                      sandboxReport.httpStatus === 200
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : sandboxReport.httpStatus === 400
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {sandboxReport.statusText}
                  </span>
                  {sandboxReport.clearanceSerialNo && (
                    <span className="font-mono text-xs text-slate-400">
                      رقم الاعتماد: {sandboxReport.clearanceSerialNo}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {sandboxReport.statusTitleAr}
                </h3>
              </div>

              {sandboxReport.isApproved && (
                <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0">
                  <QRCodeSVG value={tlvBase64Input} size={68} level="M" />
                </div>
              )}
            </div>

            {/* 3 Technical Verification Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Pillar 1: SHA-256 */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">1. بصمة التشفير SHA-256</span>
                  {sandboxReport.sha256Check.isValid ? (
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500 truncate" dir="ltr">
                  Computed: {sandboxReport.sha256Check.computedSha256.slice(0, 18)}...
                </div>
                <div
                  className={`text-[11px] font-bold ${
                    sandboxReport.sha256Check.isValid ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {sandboxReport.sha256Check.isValid ? 'متطابقة 100% مع الأصل' : 'بصمة غير مطابقة (تلاعب)'}
                </div>
              </div>

              {/* Pillar 2: TLV 6 Mandatory Tags */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">2. فحص حقول TLV الستة</span>
                  {sandboxReport.tlvCheck.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  الحقول المكتشفة: {sandboxReport.tlvCheck.presentTagsCount} / 6 حقول إلزامية
                </div>
                <div
                  className={`text-[11px] font-bold ${
                    sandboxReport.tlvCheck.isValid ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {sandboxReport.tlvCheck.isValid
                    ? 'متوافقة مع معيار Tag-Length-Value'
                    : `نقص في الحقول: [${sandboxReport.tlvCheck.missingTags.join(', ')}]`}
                </div>
              </div>

              {/* Pillar 3: 3-Decimal Tax Math */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">3. مطابقة الضريبة (بالفلس)</span>
                  {sandboxReport.taxMathCheck.isValid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  المتوقع: {sandboxReport.taxMathCheck.expectedTaxJod} | المرسل: {sandboxReport.taxMathCheck.submittedTaxJod}
                </div>
                <div
                  className={`text-[11px] font-bold ${
                    sandboxReport.taxMathCheck.isValid ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {sandboxReport.taxMathCheck.isValid
                    ? 'الفرق: 0.000 د.أ (دقيق 100%)'
                    : `انحراف ضريبي: ${sandboxReport.taxMathCheck.taxVarianceFils} د.أ`}
                </div>
              </div>
            </div>

            {/* Decoded 6 Mandatory TLV Tags Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <div className="bg-slate-100 dark:bg-slate-950 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Binary className="w-4 h-4 text-emerald-500" />
                  <span>تفكيك وفحص الحقول الستة الإلزامية في حزمة (TLV Base64 Decoder)</span>
                </span>
                <span className="text-[11px] font-mono text-slate-500">ISO/IEC 7816-4 TLV Standard</span>
              </div>
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Tag</th>
                    <th className="py-2 px-3">اسم الحقل الإلزامي (ISTD Spec)</th>
                    <th className="py-2 px-3">Length (Bytes)</th>
                    <th className="py-2 px-3 text-left">القيمة المفككة (Decoded UTF-8 Value)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono tabular-nums">
                  {[1, 2, 3, 4, 5, 6].map((tagNum) => {
                    const found = sandboxReport.tlvCheck.decodedTags.find((t) => t.tag === tagNum);
                    const defaultLabels: Record<number, string> = {
                      1: 'اسم البائع التجاري',
                      2: 'الرقم الضريبي للمكلف (TIN)',
                      3: 'تاريخ ووقت الفاتورة (ISO 8601)',
                      4: 'إجمالي الفاتورة شاملاً الضريبة',
                      5: 'قيمة ضريبة المبيعات المستحقة',
                      6: 'بصمة التشفير الرقمية (SHA-256)',
                    };
                    return (
                      <tr key={tagNum} className={found ? '' : 'bg-rose-950/15'}>
                        <td className="py-2 px-3 font-bold text-emerald-500">0x0{tagNum}</td>
                        <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300">
                          {found ? found.label : defaultLabels[tagNum]}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{found ? `${found.length} B` : 'MISSING'}</td>
                        <td className="py-2 px-3 text-left text-slate-900 dark:text-white truncate max-w-[240px]" dir="ltr">
                          {found ? (
                            found.value
                          ) : (
                            <span className="text-rose-500 font-bold">MISSING_MANDATORY_TAG_{tagNum}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Live Government JSON Response Output */}
            <div>
              <span className="text-xs text-slate-500 block mb-1.5">
                رد خادم بوابة الفوترة الإلكترونية الأردنية الموحد (Live ISTD Sandbox Response JSON):
              </span>
              <pre
                className="p-4 bg-slate-950 text-slate-200 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed"
                dir="ltr"
              >
                {sandboxReport.rawGovernmentJsonResponse}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
