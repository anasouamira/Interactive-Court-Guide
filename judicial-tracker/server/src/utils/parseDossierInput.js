'use strict';

/**
 * parseDossierInput — NUMERIC FORMAT ONLY
 *
 * Accepts either:
 *   Format A — structured: { tribunal, annee, typeCode, numero }
 *   Format B — string:     { dossier: "4521/1/2024", tribunal }
 *
 * Real Mahakim format: numero/typeCode/annee  (ALL numeric)
 * typeCode is a number 1–9, NOT a letter.
 *
 * Returns: { typeCode, numero, annee, tribunal, format }
 * Throws:  ValidationError on bad input
 */

const CURRENT_YEAR = new Date().getFullYear();

function validateYear(year) {
  const y = parseInt(year, 10);
  if (isNaN(y) || y < 1990 || y > CURRENT_YEAR + 1)
    throw new ValidationError(`السنة غير صالحة. يجب أن تكون بين 1990 و${CURRENT_YEAR + 1}.`);
  return y;
}

function validateTypeCode(code) {
  if (!code && code !== 0)
    throw new ValidationError('رمز نوع الملف مطلوب (رقم من 1 إلى 9).');
  const c = String(code).trim();
  if (!/^[1-9]$/.test(c))
    throw new ValidationError(`رمز النوع "${code}" غير صالح. يجب أن يكون رقماً من 1 إلى 9.`);
  return c;
}

function validateNumero(numero) {
  if (!numero && numero !== 0)
    throw new ValidationError('رقم الملف مطلوب.');
  const n = String(numero).trim();
  if (!/^\d{1,8}$/.test(n))
    throw new ValidationError(`رقم الملف "${numero}" غير صالح. يجب أن يكون أرقاماً فقط (1–8 أرقام).`);
  return n;
}

function validateTribunal(tribunal) {
  if (!tribunal || typeof tribunal !== 'string' || !tribunal.trim())
    throw new ValidationError('المحكمة مطلوبة.');
  return tribunal.trim().toLowerCase();
}

/**
 * Parse Format B string: "numero/typeCode/annee"
 * Exactly 3 numeric parts separated by "/"
 */
function parseDossierString(str) {
  if (typeof str !== 'string')
    throw new ValidationError('حقل الملف يجب أن يكون نصاً.');

  const parts = str.trim().split('/');
  if (parts.length !== 3)
    throw new ValidationError(
      `صيغة غير صحيحة: "${str}". الصيغة المطلوبة: رقم/نوع/سنة (مثال: 4521/1/2024).`
    );

  const [rawNumero, rawTypeCode, rawAnnee] = parts;
  return {
    numero:   validateNumero(rawNumero),
    typeCode: validateTypeCode(rawTypeCode),
    annee:    validateYear(rawAnnee),
  };
}

function parseDossierInput(input) {
  if (!input || typeof input !== 'object')
    throw new ValidationError('جسم الطلب غير صالح.');

  const tribunal = validateTribunal(input.tribunal);

  if (input.dossier !== undefined) {
    // Format B
    const { typeCode, numero, annee } = parseDossierString(input.dossier);
    return { typeCode, numero, annee, tribunal, format: 'B', raw: input.dossier };
  }

  if (input.typeCode !== undefined || input.numero !== undefined || input.annee !== undefined) {
    // Format A
    const typeCode = validateTypeCode(input.typeCode);
    const numero   = validateNumero(input.numero);
    const annee    = validateYear(input.annee);
    return { typeCode, numero, annee, tribunal, format: 'A', raw: null };
  }

  throw new ValidationError(
    'معطيات ناقصة. أدخل إما حقل "dossier" بصيغة رقم/نوع/سنة، أو الحقول "typeCode" و"numero" و"annee" بشكل منفصل.'
  );
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name       = 'ValidationError';
    this.statusCode = 400;
  }
}

module.exports = { parseDossierInput, ValidationError };
