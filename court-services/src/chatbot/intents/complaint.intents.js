// ─────────────────────────────────────────────────────────────────────────────
// complaint.intents.js
// Intent patterns for the Complaint Submission service.
// Each array contains natural language variations a real citizen would type —
// including formal Arabic, Moroccan Darija, and indirect expressions.
// ─────────────────────────────────────────────────────────────────────────────

export const complaintIntents = {
  service: 'complaint',

  // Primary trigger keywords — single words or short roots
  keywords: [
    // Formal Arabic
    'شكوى', 'شكاوى', 'شكوة', 'شكوي',
    'بلاغ', 'تبليغ', 'إبلاغ', 'أبلغ',
    'تشكي', 'تشكى', 'اشتكى', 'اشتكي',
    'مشكلة', 'مشكل', 'قضية', 'حادثة',
    'جريمة', 'اعتداء', 'سرقة', 'احتيال',
    'تهديد', 'ابتزاز', 'نصب', 'غش',
    // Moroccan Darija
    'شكاية', 'شكايات', 'مشكيت', 'تشكيت',
    'سرق', 'سرقوني', 'ضربوني', 'هددوني',
    'نصبوني', 'غشوني', 'جريت', 'الجاني',
  ],

  // Full phrases and natural sentences citizens actually type
  phrases: [
    'كيفاش نقدم شكوى',
    'كيفاش نشكي',
    'كيف أقدم شكوى',
    'أريد تقديم شكوى',
    'بغيت نشكي',
    'بغيت نقدم شكاية',
    'واش نقدر نشكي',
    'فين نشكي',
    'فين نقدم الشكوى',
    'شكوى ضد شخص',
    'شكوى ضد جاري',
    'شكوى على صاحبي',
    'تقديم شكوى في المحكمة',
    'إجراءات تقديم الشكوى',
    'خطوات الشكوى',
    'وين نشكو',
    'نشكو على فلان',
    'تقديم بلاغ للشرطة',
    'أريد الإبلاغ عن جريمة',
    'تبليغ عن جريمة',
    'كيفاش نبلغ على شخص',
    'واش يمكن نتشكى',
    'مشكل مع الجيران',
    'مشكل مع صاحب الدار',
  ],
}
