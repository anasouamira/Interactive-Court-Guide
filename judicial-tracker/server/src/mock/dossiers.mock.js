'use strict';

/**
 * Mock dossier database — NUMERIC FORMAT ONLY
 * Key: `${tribunalCode}-${typeCode}-${numero}-${annee}`
 *
 * Real Mahakim format: numero/typeCode/annee  e.g.  4521/1/2024
 * typeCode is numeric (1–9), NOT alphabetic.
 *
 * Statuses: en_cours | juge | reporte | en_attente
 */

const DOSSIERS = [
  {
    id:            'tpi-casa-1-4521-2024',
    tribunal:      'المحكمة الابتدائية بالدار البيضاء',
    tribunalCode:  'tpi-casa',
    typeCode:      '1',
    numero:        '4521',
    annee:         2024,
    numeroComplet: '4521/1/2024',
    type:          'مدني',
    status:        'en_cours',
    statusLabel:   'جارٍ',
    chambre:       'الغرفة المدنية 3',
    judge:         'الأستاذ حسن بنعلي',
    nextSession:   '2025-06-22',
    lastUpdate:    '2025-05-14',
    parties: { demandeur: 'محمد العلوي', defendeur: 'شركة إيمو كازا' },
    history: [
      { date: '2024-01-15', event: 'إيداع المقال',          status: 'done' },
      { date: '2024-01-18', event: 'تسجيل الملف',          status: 'done' },
      { date: '2024-03-20', event: 'الجلسة الأولى',         status: 'done' },
      { date: '2024-05-15', event: 'الأمر بالخبرة',         status: 'done' },
      { date: '2025-01-10', event: 'إيداع تقرير الخبير',   status: 'done' },
      { date: '2025-06-22', event: 'جلسة المداولة',         status: 'pending', current: true },
      { date: null,         event: 'النطق بالحكم',           status: 'pending' },
    ],
  },
  {
    id:            'tpi-rabat-3-1837-2023',
    tribunal:      'المحكمة الابتدائية بالرباط',
    tribunalCode:  'tpi-rabat',
    typeCode:      '3',
    numero:        '1837',
    annee:         2023,
    numeroComplet: '1837/3/2023',
    type:          'جنحي',
    status:        'juge',
    statusLabel:   'صدر الحكم',
    chambre:       'الغرفة الجنحية 1',
    judge:         'الأستاذة فاطمة الشرايبي',
    nextSession:   null,
    lastUpdate:    '2025-04-03',
    parties: { demandeur: 'النيابة العامة', defendeur: 'خالد رامي' },
    history: [
      { date: '2023-02-05', event: 'إحالة النيابة العامة',   status: 'done' },
      { date: '2023-03-20', event: 'فتح التحقيق',            status: 'done' },
      { date: '2023-10-10', event: 'الإحالة للمحاكمة',      status: 'done' },
      { date: '2025-01-15', event: 'الجلسة الرئيسية',        status: 'done' },
      { date: '2025-02-20', event: 'المرافعات',              status: 'done' },
      { date: '2025-04-03', event: 'النطق بالحكم',            status: 'done' },
    ],
  },
  {
    id:            'tpi-mkch-6-9104-2024',
    tribunal:      'قسم قضاء الأسرة — مراكش',
    tribunalCode:  'tpi-mkch',
    typeCode:      '6',
    numero:        '9104',
    annee:         2024,
    numeroComplet: '9104/6/2024',
    type:          'أسرة',
    status:        'en_attente',
    statusLabel:   'في الانتظار',
    chambre:       'قسم الأسرة',
    judge:         'الأستاذ إدريس وعلي',
    nextSession:   '2025-07-10',
    lastUpdate:    '2025-04-28',
    parties: { demandeur: 'نادية الفاسي', defendeur: 'يوسف الفاسي' },
    history: [
      { date: '2024-01-10', event: 'إيداع طلب الطلاق',      status: 'done' },
      { date: '2024-01-12', event: 'التسجيل',               status: 'done' },
      { date: '2024-03-15', event: 'محاولة الصلح',           status: 'done' },
      { date: '2024-11-20', event: 'الخبرة الاجتماعية',      status: 'done' },
      { date: '2025-07-10', event: 'تحديد الجلسة',           status: 'pending', current: true },
      { date: null,         event: 'الحكم',                  status: 'pending' },
    ],
  },
  {
    id:            'tcom-casa-2-3320-2023',
    tribunal:      'المحكمة التجارية بالدار البيضاء',
    tribunalCode:  'tcom-casa',
    typeCode:      '2',
    numero:        '3320',
    annee:         2023,
    numeroComplet: '3320/2/2023',
    type:          'تجاري',
    status:        'reporte',
    statusLabel:   'مؤجَّل',
    chambre:       'الغرفة التجارية 2',
    judge:         'الأستاذة سعدية الطازي',
    nextSession:   '2025-08-05',
    lastUpdate:    '2025-05-03',
    parties: { demandeur: 'مجموعة أطلس للاستيراد والتصدير', defendeur: 'لوجيستيكا سود' },
    history: [
      { date: '2023-06-01', event: 'إيداع الطلب',            status: 'done' },
      { date: '2023-06-05', event: 'التسجيل',               status: 'done' },
      { date: '2023-09-18', event: 'الجلسة الأولى',          status: 'done' },
      { date: '2024-02-14', event: 'خبرة محاسبية',           status: 'done' },
      { date: '2025-03-20', event: 'تأجيل — غياب طرف',      status: 'done' },
      { date: '2025-08-05', event: 'جلسة جديدة محددة',       status: 'pending', current: true },
    ],
  },
  {
    id:            'tadm-rabat-5-718-2025',
    tribunal:      'المحكمة الإدارية بالرباط',
    tribunalCode:  'tadm-rabat',
    typeCode:      '5',
    numero:        '718',
    annee:         2025,
    numeroComplet: '718/5/2025',
    type:          'إداري',
    status:        'en_cours',
    statusLabel:   'جارٍ',
    chambre:       'الغرفة الإدارية 1',
    judge:         'الأستاذ عبد الحق موساوي',
    nextSession:   '2025-09-15',
    lastUpdate:    '2025-05-10',
    parties: { demandeur: 'جمعية مواطني سلا', defendeur: 'جماعة سلا' },
    history: [
      { date: '2025-01-08', event: 'إيداع الطعن',             status: 'done' },
      { date: '2025-01-10', event: 'التسجيل',                status: 'done' },
      { date: '2025-03-22', event: 'استلام مذكرة الجواب',    status: 'done' },
      { date: '2025-09-15', event: 'جلسة المرافعات',          status: 'pending', current: true },
      { date: null,         event: 'المداولة والحكم',          status: 'pending' },
    ],
  },
];

// O(1) lookup index: `${tribunalCode}-${typeCode}-${numero}-${annee}`
const DOSSIER_INDEX = new Map(
  DOSSIERS.map(d => [`${d.tribunalCode}-${d.typeCode}-${d.numero}-${d.annee}`, d])
);

// Tribunal alias map for flexible resolution
const TRIBUNAL_ALIASES = {
  'casablanca':   'tpi-casa',
  'tpi-casa':     'tpi-casa',
  'rabat':        'tpi-rabat',
  'tpi-rabat':    'tpi-rabat',
  'marrakech':    'tpi-mkch',
  'tpi-mkch':     'tpi-mkch',
  'tcom-casa':    'tcom-casa',
  'tadm-rabat':   'tadm-rabat',
  'fes':          'tpi-fes',
  'tanger':       'tpi-tng',
  'agadir':       'tpi-agd',
};

// Numeric type codes description (Arabic)
const TYPE_CODES = {
  '1': 'مدني',
  '2': 'تجاري',
  '3': 'جنحي',
  '4': 'جنائي',
  '5': 'إداري',
  '6': 'أسرة',
  '7': 'عقاري',
  '8': 'استئناف',
  '9': 'نقض',
};

module.exports = { DOSSIERS, DOSSIER_INDEX, TRIBUNAL_ALIASES, TYPE_CODES };
