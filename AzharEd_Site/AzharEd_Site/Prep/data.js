// MAKTAB Prep — catalogue + sample content. Real papers replace SAMPLE_* once Azhar's PDFs are extracted.
window.PREP = (() => {
  const BOARDS = [
    { id: 'lhr', name: 'BISE Lahore', short: 'Lahore' },
    { id: 'grw', name: 'BISE Gujranwala', short: 'Gujranwala' },
    { id: 'pu', name: 'University of the Punjab', short: 'PU (B.Com)' },
  ];
  const LEVELS = [
    { id: '9', name: 'Class 9', long: 'Matric · Part I', boards: ['lhr', 'grw'], groups: ['sci', 'arts'] },
    { id: '10', name: 'Class 10', long: 'Matric · Part II', boards: ['lhr', 'grw'], groups: ['sci', 'arts'] },
    { id: '11', name: 'Class 11', long: 'Intermediate · Part I', boards: ['lhr', 'grw'], groups: ['premed', 'preeng', 'ics', 'icom', 'hum'] },
    { id: '12', name: 'Class 12', long: 'Intermediate · Part II', boards: ['lhr', 'grw'], groups: ['premed', 'preeng', 'ics', 'icom', 'hum'] },
    { id: 'bcom1', name: 'B.Com Part I', long: 'University of the Punjab', boards: ['pu'], groups: ['bcom'] },
    { id: 'bcom2', name: 'B.Com Part II', long: 'University of the Punjab', boards: ['pu'], groups: ['bcom'] },
  ];
  const GROUPS = { sci: 'Science', arts: 'Arts', premed: 'Pre-Medical', preeng: 'Pre-Engineering', ics: 'ICS', icom: 'I.Com', hum: 'Humanities', bcom: 'B.Com' };
  // subjects per level+group (id, name, icon, pattern key)
  const S = (id, name, icon, pat) => ({ id, name, icon, pat });
  const COMMON_9_10 = [S('eng', 'English', '📘', 'matric_lang'), S('urd', 'Urdu', '📗', 'matric_lang'), S('isl', 'Islamiyat', '🕌', 'matric_isl'), S('tq', 'Tarjama-tul-Quran', '📖', 'matric_50'), S('pak', 'Pakistan Studies', '🇵🇰', 'matric_50')];
  const SUBJECTS = {
    '9|sci': [S('phy', 'Physics', '⚛️', 'matric_sci'), S('chem', 'Chemistry', '🧪', 'matric_sci'), S('bio', 'Biology', '🧬', 'matric_sci'), S('cs', 'Computer Science', '💻', 'matric_sci'), S('math', 'Mathematics', '📐', 'matric_math'), ...COMMON_9_10],
    '10|sci': [S('phy', 'Physics', '⚛️', 'matric_sci'), S('chem', 'Chemistry', '🧪', 'matric_sci'), S('bio', 'Biology', '🧬', 'matric_sci'), S('cs', 'Computer Science', '💻', 'matric_sci'), S('math', 'Mathematics', '📐', 'matric_math'), ...COMMON_9_10],
    '9|arts': [S('gsci', 'General Science', '🔬', 'matric_sci'), S('gmath', 'General Mathematics', '📐', 'matric_math'), S('civ', 'Civics', '🏛️', 'matric_50'), S('edu', 'Education', '🎓', 'matric_50'), ...COMMON_9_10],
    '10|arts': [S('gsci', 'General Science', '🔬', 'matric_sci'), S('gmath', 'General Mathematics', '📐', 'matric_math'), S('civ', 'Civics', '🏛️', 'matric_50'), S('edu', 'Education', '🎓', 'matric_50'), ...COMMON_9_10],
    '11|premed': [S('phy', 'Physics', '⚛️', 'inter_sci'), S('chem', 'Chemistry', '🧪', 'inter_sci'), S('bio', 'Biology', '🧬', 'inter_sci'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('isl', 'Islamiyat', '🕌', 'inter_50')],
    '11|preeng': [S('phy', 'Physics', '⚛️', 'inter_sci'), S('chem', 'Chemistry', '🧪', 'inter_sci'), S('math', 'Mathematics', '📐', 'inter_math'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('isl', 'Islamiyat', '🕌', 'inter_50')],
    '11|ics': [S('cs', 'Computer Science', '💻', 'inter_sci'), S('phy', 'Physics', '⚛️', 'inter_sci'), S('math', 'Mathematics', '📐', 'inter_math'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('isl', 'Islamiyat', '🕌', 'inter_50')],
    '11|icom': [S('acc', 'Principles of Accounting', '🧾', 'inter_com'), S('econ', 'Principles of Economics', '📈', 'inter_com'), S('com', 'Principles of Commerce', '🏪', 'inter_com'), S('bmath', 'Business Mathematics', '📐', 'inter_com'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang')],
    '11|hum': [S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('civ', 'Civics', '🏛️', 'inter_50'), S('edu', 'Education', '🎓', 'inter_50'), S('isl', 'Islamiyat', '🕌', 'inter_50')],
    '12|premed': [S('phy', 'Physics', '⚛️', 'inter_sci'), S('chem', 'Chemistry', '🧪', 'inter_sci'), S('bio', 'Biology', '🧬', 'inter_sci'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('pak', 'Pakistan Studies', '🇵🇰', 'inter_50')],
    '12|preeng': [S('phy', 'Physics', '⚛️', 'inter_sci'), S('chem', 'Chemistry', '🧪', 'inter_sci'), S('math', 'Mathematics', '📐', 'inter_math'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('pak', 'Pakistan Studies', '🇵🇰', 'inter_50')],
    '12|ics': [S('cs', 'Computer Science', '💻', 'inter_sci'), S('phy', 'Physics', '⚛️', 'inter_sci'), S('math', 'Mathematics', '📐', 'inter_math'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('pak', 'Pakistan Studies', '🇵🇰', 'inter_50')],
    '12|icom': [S('acc', 'Principles of Accounting', '🧾', 'inter_com'), S('econ', 'Principles of Economics', '📈', 'inter_com'), S('bank', 'Principles of Banking', '🏦', 'inter_com'), S('stat', 'Business Statistics', '📊', 'inter_com'), S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang')],
    '12|hum': [S('eng', 'English', '📘', 'inter_lang'), S('urd', 'Urdu', '📗', 'inter_lang'), S('civ', 'Civics', '🏛️', 'inter_50'), S('edu', 'Education', '🎓', 'inter_50'), S('pak', 'Pakistan Studies', '🇵🇰', 'inter_50')],
    'bcom1|bcom': [S('facc', 'Financial Accounting', '🧾', 'bcom'), S('bstat', 'Business Statistics & Mathematics', '📊', 'bcom'), S('econ', 'Economics', '📈', 'bcom'), S('bcomm', 'Business Communication & Report Writing', '✉️', 'bcom'), S('itb', 'Introduction to Business', '🏪', 'bcom'), S('mbf', 'Money, Banking & Finance', '🏦', 'bcom'), S('capp', 'Computer Applications in Business', '💻', 'bcom')],
    'bcom2|bcom': [S('aacc', 'Advanced Financial Accounting', '🧾', 'bcom'), S('cacc', 'Cost Accounting', '🧮', 'bcom'), S('aud', 'Auditing', '🔍', 'bcom'), S('blaw', 'Business Law', '⚖️', 'bcom'), S('tax', 'Business Taxation', '💰', 'bcom'), S('epak', 'Economics of Pakistan', '🇵🇰', 'bcom'), S('bmgt', 'Business Management', '📋', 'bcom')],
  };
  // paper patterns — editable in Admin → Patterns
  const PATTERNS = {
    matric_sci: { name: 'Matric science subject · 60 marks', total: 60, obj: { count: 12, marks: 1, minutes: 15 }, subj: { minutes: 105, short: [{ q: 'Q.2', of: 8, attempt: 5, marks: 2 }, { q: 'Q.3', of: 8, attempt: 5, marks: 2 }, { q: 'Q.4', of: 8, attempt: 5, marks: 2 }], long: { of: 3, attempt: 2, marks: 9 } } },
    matric_math: { name: 'Matric mathematics · 75 marks', total: 75, obj: { count: 15, marks: 1, minutes: 20 }, subj: { minutes: 130, short: [{ q: 'Q.2', of: 9, attempt: 6, marks: 2 }, { q: 'Q.3', of: 9, attempt: 6, marks: 2 }, { q: 'Q.4', of: 9, attempt: 6, marks: 2 }], long: { of: 5, attempt: 3, marks: 8 } } },
    matric_lang: { name: 'Matric language · 75 marks', total: 75, obj: { count: 19, marks: 1, minutes: 20 }, subj: { minutes: 130, short: [{ q: 'Q.2', of: 8, attempt: 5, marks: 2 }, { q: 'Q.3', of: 8, attempt: 5, marks: 2 }], long: { of: 4, attempt: 3, marks: 12 } } },
    matric_isl: { name: 'Matric Islamiyat · 60 marks', total: 60, obj: { count: 20, marks: 1, minutes: 20 }, subj: { minutes: 110, short: [{ q: 'Q.2', of: 8, attempt: 5, marks: 2 }, { q: 'Q.3', of: 8, attempt: 5, marks: 2 }, { q: 'Q.4', of: 6, attempt: 4, marks: 2 }], long: { of: 3, attempt: 2, marks: 6 } } },
    matric_50: { name: 'Matric · 50 marks', total: 50, obj: { count: 10, marks: 1, minutes: 15 }, subj: { minutes: 105, short: [{ q: 'Q.2', of: 8, attempt: 6, marks: 2 }, { q: 'Q.3', of: 8, attempt: 6, marks: 2 }], long: { of: 3, attempt: 2, marks: 8 } } },
    inter_sci: { name: 'Inter science subject · 85 marks', total: 85, obj: { count: 17, marks: 1, minutes: 20 }, subj: { minutes: 160, short: [{ q: 'Q.2', of: 12, attempt: 8, marks: 2 }, { q: 'Q.3', of: 12, attempt: 8, marks: 2 }, { q: 'Q.4', of: 9, attempt: 6, marks: 2 }], long: { of: 3, attempt: 2, marks: 12 } } },
    inter_math: { name: 'Inter mathematics · 100 marks', total: 100, obj: { count: 20, marks: 1, minutes: 30 }, subj: { minutes: 150, short: [{ q: 'Q.2', of: 12, attempt: 8, marks: 2 }, { q: 'Q.3', of: 12, attempt: 8, marks: 2 }, { q: 'Q.4', of: 13, attempt: 9, marks: 2 }], long: { of: 5, attempt: 3, marks: 10 } } },
    inter_lang: { name: 'Inter language · 100 marks', total: 100, obj: { count: 20, marks: 1, minutes: 30 }, subj: { minutes: 150, short: [{ q: 'Q.2', of: 9, attempt: 6, marks: 2 }, { q: 'Q.3', of: 8, attempt: 5, marks: 2 }], long: { of: 4, attempt: 3, marks: 15 } } },
    inter_50: { name: 'Inter · 50 marks', total: 50, obj: { count: 10, marks: 1, minutes: 15 }, subj: { minutes: 105, short: [{ q: 'Q.2', of: 8, attempt: 6, marks: 2 }, { q: 'Q.3', of: 8, attempt: 6, marks: 2 }], long: { of: 3, attempt: 2, marks: 8 } } },
    inter_com: { name: 'Inter commerce subject · 75 marks', total: 75, obj: { count: 15, marks: 1, minutes: 20 }, subj: { minutes: 130, short: [{ q: 'Q.2', of: 8, attempt: 6, marks: 2 }, { q: 'Q.3', of: 8, attempt: 6, marks: 2 }, { q: 'Q.4', of: 8, attempt: 6, marks: 2 }], long: { of: 3, attempt: 2, marks: 12 } } },
    bcom: { name: 'B.Com paper · 100 marks', total: 100, obj: { count: 20, marks: 1, minutes: 30 }, subj: { minutes: 150, short: [{ q: 'Q.2', of: 10, attempt: 5, marks: 4 }], long: { of: 6, attempt: 4, marks: 15 } } },
  };
  // chapters used by the sample bank / generator (real books replace these)
  const CHAPTERS = {
    'phy|9': ['Physical Quantities and Measurement', 'Kinematics', 'Dynamics', 'Turning Effect of Forces', 'Gravitation', 'Work and Energy', 'Properties of Matter', 'Thermal Properties of Matter', 'Transfer of Heat'],
    'chem|9': ['Fundamentals of Chemistry', 'Structure of Atoms', 'Periodic Table and Periodicity', 'Structure of Molecules', 'Physical States of Matter', 'Solutions', 'Electrochemistry', 'Chemical Reactivity'],
    'bio|9': ['Introduction to Biology', 'Solving a Biological Problem', 'Biodiversity', 'Cells and Tissues', 'Cell Cycle', 'Enzymes', 'Bioenergetics', 'Nutrition', 'Transport'],
    'chem|10': ['Chemical Equilibrium', 'Acids, Bases and Salts', 'Organic Chemistry', 'Hydrocarbons', 'Biochemistry', 'The Atmosphere', 'Water', 'Chemical Industries'],
    'phy|10': ['Simple Harmonic Motion and Waves', 'Sound', 'Geometrical Optics', 'Electrostatics', 'Current Electricity', 'Electromagnetism', 'Basic Electronics', 'Information and Communication Technology', 'Atomic and Nuclear Physics'],
    'phy|11': ['Measurements', 'Vectors and Equilibrium', 'Motion and Force', 'Work and Energy', 'Circular Motion', 'Fluid Dynamics', 'Oscillations', 'Waves', 'Physical Optics', 'Optical Instruments', 'Heat and Thermodynamics'],
    'facc|bcom1': ['Introduction to Accounting', 'Journal and Ledger', 'Cash Book', 'Trial Balance', 'Bank Reconciliation Statement', 'Depreciation', 'Final Accounts', 'Rectification of Errors', 'Bills of Exchange', 'Partnership Accounts'],
  };
  // ---- real content: bank/index.js (chapters + paper index) and bank/<class>.js (questions, loaded per class)
  const IDX = window.PREP_INDEX || { CHAPTERS: {}, PAPERS: [], counts: {} };
  Object.assign(CHAPTERS, IDX.CHAPTERS);
  const BANK = [];
  const PAPERS = IDX.PAPERS || [];
  const QCOUNTS = {}; let QCOUNT = 0; for (const [k, v] of Object.entries(IDX.counts || {})) { const lvl = k.split('|')[1]; QCOUNTS[lvl] = (QCOUNTS[lvl] || 0) + v; QCOUNT += v; }
  const PLANS = [
    { id: 'm', name: 'Monthly', price: 499, days: 31, blurb: 'All papers of your class & board, paper generator, progress' },
    { id: 'y', name: 'Exam year', price: 2999, days: 365, blurb: 'Everything, for the whole session — best value', best: true },
  ];
  const PAY = { jazzcash: '0300-0000000', easypaisa: '0300-0000000', bank: 'Azhar Publishers · Meezan Bank · PK00MEZN0000000000000000', whatsapp: '923000000000' };
  return { BOARDS, LEVELS, GROUPS, SUBJECTS, PATTERNS, CHAPTERS, BANK, PAPERS, PLANS, PAY, QCOUNTS, QCOUNT, BUILD: IDX.build };
})();
