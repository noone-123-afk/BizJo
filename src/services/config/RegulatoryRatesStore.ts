import Decimal from 'decimal.js';
import { SystemGovernanceService } from '../governance/SystemGovernanceService';

Decimal.set({ precision: 28, rounding: Decimal.ROUND_HALF_UP });

export interface IncomeTaxBracketRule {
  id: string;
  labelAr: string;
  sliceCapJod: number; // حجم الشريحة بالدينار (مثلاً 5000 للشريحة الأولى)
  rateDecimal: number; // النسبة المئوية ككسر عشري (مثلاً 0.05 لـ 5%)
}

export interface IncomeTaxExemptionsRule {
  personalExemptionJod: number; // 9,000 د.أ
  familyExemptionJod: number; // 9,000 د.أ
  dependentExemptionPerChildJod: number; // 1,000 د.أ
  maxDependentsCount: number; // 3 معالين
  maxExpenseExemptionSingleJod: number; // 1,000 د.أ
  maxAdditionalFamilyExemptionsJod: number; // 5,000 د.أ
  maxTotalSingleExemptionCapJod: number; // 10,000 د.أ
  maxTotalFamilyExemptionCapJod: number; // 23,000 د.أ
  individualNatContribThresholdJod: number; // 200,000 د.أ
  individualNatContribRateDecimal: number; // 0.01 (1%)
}

export interface SocialSecurityRatesRule {
  insurableSalaryCeilingMonthlyJod: number; // 3,612 د.أ (سقف الأجر الخاضع للضمان)
  insurableSalaryFloorMonthlyJod: number; // 290 د.أ (الحد الأدنى للأجور المعتمد)
  // تفصيل اشتراكات المؤمن عليه (الموظف) - الإجمالي القياسي 7.50%
  employeeOldAgeDisabilityDeathRate: number; // 0.065 (6.50% تأمين الشيخوخة والعجز والوفاة)
  employeeUnemploymentRate: number; // 0.010 (1.00% تأمين التعطل عن العمل)
  // تفصيل اشتراكات المنشأة (صاحب العمل) - الإجمالي القياسي 14.25%
  employerOldAgeDisabilityDeathRate: number; // 0.110 (11.00% تأمين الشيخوخة والعجز والوفاة)
  employerWorkInjuryRate: number; // 0.020 (2.00% تأمين إصابات العمل)
  employerMaternityRate: number; // 0.0075 (0.75% تأمين الأمومة)
  employerUnemploymentRate: number; // 0.005 (0.50% تأمين التعطل عن العمل)
  // المهن الخطرة
  employerHazardousExtraRate: number; // 0.010 (1.00% مساهمة إضافية للمهن الخطرة)
}

export interface RegulatoryDatabaseConfig {
  versionTag: string;
  lastUpdatedIso: string;
  legalReferenceNoteAr: string;
  incomeTaxExemptions: IncomeTaxExemptionsRule;
  incomeTaxBrackets: IncomeTaxBracketRule[];
  socialSecurity: SocialSecurityRatesRule;
}

const STORAGE_KEY = 'JO_ENTERPRISE_REGULATORY_RATES_DB_V1';
const UPDATE_EVENT = 'jo-regulatory-rates-updated';

export const DEFAULT_REGULATORY_CONFIG: RegulatoryDatabaseConfig = {
  versionTag: 'ISTD-SSC-2026.1',
  lastUpdatedIso: '2026-01-01',
  legalReferenceNoteAr:
    'قانون ضريبة الدخل رقم (34) لسنة 2014 وتعديلاته بالقانون رقم (38) لسنة 2018 + قانون الضمان الاجتماعي رقم (1) لسنة 2014 والأنظمة الصادرة بموجبه.',
  incomeTaxExemptions: {
    personalExemptionJod: 9000,
    familyExemptionJod: 9000,
    dependentExemptionPerChildJod: 1000,
    maxDependentsCount: 3,
    maxExpenseExemptionSingleJod: 1000,
    maxAdditionalFamilyExemptionsJod: 5000,
    maxTotalSingleExemptionCapJod: 10000,
    maxTotalFamilyExemptionCapJod: 23000,
    individualNatContribThresholdJod: 200000,
    individualNatContribRateDecimal: 0.01,
  },
  incomeTaxBrackets: [
    {
      id: 'BRK-1',
      labelAr: 'الشريحة الأولى (1 – 5,000 د.أ الأولى)',
      sliceCapJod: 5000,
      rateDecimal: 0.05,
    },
    {
      id: 'BRK-2',
      labelAr: 'الشريحة الثانية (5,001 – 10,000 د.أ)',
      sliceCapJod: 5000,
      rateDecimal: 0.10,
    },
    {
      id: 'BRK-3',
      labelAr: 'الشريحة الثالثة (10,001 – 15,000 د.أ)',
      sliceCapJod: 5000,
      rateDecimal: 0.15,
    },
    {
      id: 'BRK-4',
      labelAr: 'الشريحة الرابعة (15,001 – 20,000 د.أ)',
      sliceCapJod: 5000,
      rateDecimal: 0.20,
    },
    {
      id: 'BRK-5',
      labelAr: 'الشريحة الخامسة (20,001 – 1,000,000 د.أ)',
      sliceCapJod: 980000,
      rateDecimal: 0.25,
    },
    {
      id: 'BRK-6',
      labelAr: 'الشريحة السادسة (ما يتجاوز 1,000,000 د.أ)',
      sliceCapJod: 999999999,
      rateDecimal: 0.30,
    },
  ],
  socialSecurity: {
    insurableSalaryCeilingMonthlyJod: 3612,
    insurableSalaryFloorMonthlyJod: 290,
    employeeOldAgeDisabilityDeathRate: 0.065,
    employeeUnemploymentRate: 0.01,
    employerOldAgeDisabilityDeathRate: 0.11,
    employerWorkInjuryRate: 0.02,
    employerMaternityRate: 0.0075,
    employerUnemploymentRate: 0.005,
    employerHazardousExtraRate: 0.01,
  },
};

export class RegulatoryRatesStore {
  public static getConfig(): RegulatoryDatabaseConfig {
    if (typeof window === 'undefined') return DEFAULT_REGULATORY_CONFIG;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_REGULATORY_CONFIG;
      const parsed = JSON.parse(raw) as RegulatoryDatabaseConfig;
      if (!parsed || !parsed.incomeTaxBrackets || !parsed.socialSecurity) {
        return DEFAULT_REGULATORY_CONFIG;
      }
      return parsed;
    } catch {
      return DEFAULT_REGULATORY_CONFIG;
    }
  }

  public static saveConfig(newConfig: RegulatoryDatabaseConfig, actorName = 'مستشار الضرائب والضمان'): void {
    if (typeof window === 'undefined') return;
    const prev = this.getConfig();
    const updated: RegulatoryDatabaseConfig = {
      ...newConfig,
      lastUpdatedIso: new Date().toISOString().slice(0, 10),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));

    SystemGovernanceService.recordAuditAction({
      actorName,
      actorRole: 'إدارة التشريعات الضريبية والضمان',
      moduleName: 'قاعدة بيانات الشرائح الضريبية ونسب الضمان الاجتماعي',
      actionLabel: 'تحديث معلمات الشرائح الضريبية أو نسب الضمان الاجتماعي',
      oldValue: `الإصدار: ${prev.versionTag} | سقف الضمان: ${prev.socialSecurity.insurableSalaryCeilingMonthlyJod} د.أ`,
      newValue: `الإصدار: ${updated.versionTag} | سقف الضمان: ${updated.socialSecurity.insurableSalaryCeilingMonthlyJod} د.أ`,
    });
  }

  public static resetToDefaults(): RegulatoryDatabaseConfig {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REGULATORY_CONFIG));
      window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
    }
    return DEFAULT_REGULATORY_CONFIG;
  }

  public static subscribe(callback: () => void): () => void {
    if (typeof window === 'undefined') return () => {};
    window.addEventListener(UPDATE_EVENT, callback);
    return () => window.removeEventListener(UPDATE_EVENT, callback);
  }
}
