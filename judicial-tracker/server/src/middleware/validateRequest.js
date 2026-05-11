'use strict';

const { body, validationResult } = require('express-validator');
const { normalizeError }         = require('../utils/normalizeResponse');

/**
 * Validation rules for POST /api/dossier/search
 * Numeric format ONLY: numero/typeCode/annee  e.g. 4521/1/2024
 */
const validateSearchRequest = [

  body('tribunal')
    .exists({ checkFalsy: true }).withMessage('المحكمة مطلوبة.')
    .isString().trim()
    .isLength({ min: 2, max: 100 }).withMessage('اسم المحكمة غير صالح.'),

  body('annee')
    .if(body('dossier').not().exists())
    .exists({ checkFalsy: true }).withMessage('السنة مطلوبة.')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage(`السنة يجب أن تكون بين 1990 و${new Date().getFullYear() + 1}.`),

  body('typeCode')
    .if(body('dossier').not().exists())
    .exists({ checkFalsy: true }).withMessage('رمز النوع مطلوب (1–9).')
    .matches(/^[1-9]$/).withMessage('رمز النوع يجب أن يكون رقماً من 1 إلى 9.'),

  body('numero')
    .if(body('dossier').not().exists())
    .exists({ checkFalsy: true }).withMessage('رقم الملف مطلوب.')
    .matches(/^\d{1,8}$/).withMessage('رقم الملف يجب أن يتكون من أرقام فقط (1–8 أرقام).'),

  // Format B: "numero/typeCode/annee" — all numeric parts
  body('dossier')
    .optional()
    .isString().trim()
    .matches(/^\d{1,8}\/[1-9]\/\d{4}$/)
    .withMessage('صيغة حقل الملف غير صحيحة. المطلوب: رقم/نوع/سنة (مثال: 4521/1/2024).'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(
        normalizeError(errors.array()[0].msg, 400, {
          fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
          hint:   'الصيغة أ: { tribunal, annee, typeCode, numero } | الصيغة ب: { dossier: "4521/1/2024", tribunal }',
        })
      );
    }
    next();
  },
];

module.exports = { validateSearchRequest };
