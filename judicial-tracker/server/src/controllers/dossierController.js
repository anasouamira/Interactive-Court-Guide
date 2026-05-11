'use strict';

const { parseDossierInput, ValidationError } = require('../utils/parseDossierInput');
const { normalizeError }                      = require('../utils/normalizeResponse');
const dossierService                          = require('../services/dossierService');

async function searchDossier(req, res, next) {
  try {
    let parsed;
    try {
      parsed = parseDossierInput(req.body);
    } catch (err) {
      if (err instanceof ValidationError) {
        return res.status(400).json(
          normalizeError(err.message, 400, {
            hint: 'الصيغة أ: { tribunal, annee, typeCode, numero } | الصيغة ب: { dossier: "4521/1/2024", tribunal }',
          })
        );
      }
      throw err;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[dossier] بحث → المحكمة=${parsed.tribunal} النوع=${parsed.typeCode} الرقم=${parsed.numero} السنة=${parsed.annee} الصيغة=${parsed.format}`
      );
    }

    const result = await dossierService.search({
      tribunal: parsed.tribunal,
      typeCode: parsed.typeCode,
      numero:   parsed.numero,
      annee:    parsed.annee,
    });

    const httpStatus = result.success ? 200 : 404;
    return res.status(httpStatus).json({
      ...result,
      meta: {
        requestId: req.requestId,
        format:    parsed.format,
        query: {
          tribunal: parsed.tribunal,
          typeCode: parsed.typeCode,
          numero:   parsed.numero,
          annee:    parsed.annee,
        },
      },
    });

  } catch (err) {
    next(err);
  }
}

function getDossierFormats(req, res) {
  res.json({
    success: true,
    title:   'صيغ الملفات المدعومة',
    formats: {
      A: {
        description: 'حقول منفصلة',
        example: { tribunal: 'casablanca', annee: 2024, typeCode: '1', numero: '4521' },
      },
      B: {
        description: 'رقم الملف الكامل — رقم/نوع/سنة',
        example: { dossier: '4521/1/2024', tribunal: 'casablanca' },
      },
    },
    typeCodes: {
      '1': 'مدني', '2': 'تجاري', '3': 'جنحي',
      '4': 'جنائي', '5': 'إداري', '6': 'أسرة',
      '7': 'عقاري', '8': 'استئناف', '9': 'نقض',
    },
    tribunals: [
      'casablanca', 'rabat', 'marrakech', 'fes', 'tanger',
      'agadir', 'meknes', 'oujda', 'tpi-casa', 'tpi-rabat',
      'tpi-mkch', 'tcom-casa', 'tadm-rabat',
    ],
  });
}

module.exports = { searchDossier, getDossierFormats };
