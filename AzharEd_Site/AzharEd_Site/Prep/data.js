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
  const COMMON_9_10 = [S('eng', 'English', '📘', 'matric_lang'), S('urd', 'Urdu', '📗', 'matric_lang'), S('isl', 'Islamiyat', '🕌', 'matric_50'), S('pak', 'Pakistan Studies', '🇵🇰', 'matric_50')];
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
  // ---- SAMPLE BANK (demo content, clearly marked). id, subject, level, chapter index, type: mcq|short|long
  let n = 0; const Q = (subject, level, ch, type, text, opts, ans, model) => ({ id: 'q' + (++n), subject, level, ch, type, text, opts: opts || null, ans: ans == null ? null : ans, model: model || '', sample: true });
  const BANK = [
    // 9th Physics · Ch1 Physical quantities
    Q('phy', '9', 0, 'mcq', 'The SI unit of temperature is:', ['Celsius', 'Fahrenheit', 'Kelvin', 'Joule'], 2),
    Q('phy', '9', 0, 'mcq', 'One micrometre is equal to:', ['10⁻³ m', '10⁻⁶ m', '10⁻⁹ m', '10⁻¹² m'], 1),
    Q('phy', '9', 0, 'mcq', 'Which of the following is a derived quantity?', ['Length', 'Mass', 'Force', 'Time'], 2),
    Q('phy', '9', 0, 'mcq', 'The number of significant figures in 0.00450 is:', ['2', '3', '4', '5'], 1),
    Q('phy', '9', 0, 'short', 'Define base quantities and give two examples.', null, null, 'Base quantities are the quantities on the basis of which other quantities are expressed; they are chosen as independent. Examples: length (metre), mass (kilogram).'),
    Q('phy', '9', 0, 'short', 'What is a least count? Write the least count of a vernier callipers.', null, null, 'The least count is the smallest measurement an instrument can read. Least count of a vernier callipers = 1 mm − 0.9 mm = 0.1 mm = 0.01 cm.'),
    Q('phy', '9', 0, 'short', 'Write 0.000034 kg and 4,500,000 m in scientific notation.', null, null, '3.4 × 10⁻⁵ kg and 4.5 × 10⁶ m.'),
    Q('phy', '9', 0, 'long', 'Describe the construction and working of a screw gauge. How is its least count found?', null, null, 'Construction: U-shaped frame, anvil, spindle, sleeve with main scale, thimble with circular scale (100 divisions), ratchet. Working: object placed between anvil and spindle, thimble rotated until it touches, reading = main scale + (circular scale division × least count). Least count = pitch ÷ number of circular divisions = 1 mm ÷ 100 = 0.01 mm.'),
    // Ch2 Kinematics
    Q('phy', '9', 1, 'mcq', 'A body is said to be in uniform motion if it covers:', ['unequal distances in equal times', 'equal distances in equal intervals of time', 'equal distances in unequal times', 'zero distance'], 1),
    Q('phy', '9', 1, 'mcq', 'The slope of a distance–time graph gives:', ['acceleration', 'speed', 'force', 'displacement'], 1),
    Q('phy', '9', 1, 'mcq', 'A car starts from rest and reaches 20 m/s in 5 s. Its acceleration is:', ['2 m/s²', '4 m/s²', '5 m/s²', '100 m/s²'], 1),
    Q('phy', '9', 1, 'mcq', 'The value of g near the surface of the Earth is approximately:', ['9.8 m/s²', '8.9 m/s²', '98 m/s²', '1 m/s²'], 0),
    Q('phy', '9', 1, 'short', 'Differentiate between distance and displacement.', null, null, 'Distance is the total length of the path travelled (scalar). Displacement is the shortest directed distance between the initial and final positions (vector).'),
    Q('phy', '9', 1, 'short', 'A train moves with a uniform velocity of 36 km/h for 10 s. Find the distance travelled.', null, null, '36 km/h = 10 m/s; S = vt = 10 × 10 = 100 m.'),
    Q('phy', '9', 1, 'short', 'What is meant by acceleration? Write its unit.', null, null, 'Rate of change of velocity: a = (vf − vi)/t. SI unit: m/s².'),
    Q('phy', '9', 1, 'long', 'Derive the third equation of motion (2aS = vf² − vi²) using a speed–time graph.', null, null, 'Area under the graph gives S = ½(vi + vf)t; from the first equation t = (vf − vi)/a; substituting: S = (vf + vi)(vf − vi)/2a, hence 2aS = vf² − vi².'),
    Q('phy', '9', 1, 'long', 'A stone is dropped from the top of a tower and reaches the ground in 3 s. Find the height of the tower and the velocity with which it strikes the ground. (g = 10 m/s²)', null, null, 'h = ½gt² = ½ × 10 × 9 = 45 m; v = gt = 30 m/s.'),
    // Ch3 Dynamics
    Q('phy', '9', 2, 'mcq', 'Newton’s first law of motion is also called the law of:', ['momentum', 'inertia', 'gravitation', 'friction'], 1),
    Q('phy', '9', 2, 'mcq', 'The SI unit of momentum is:', ['N', 'kg m/s', 'kg m/s²', 'J'], 1),
    Q('phy', '9', 2, 'mcq', 'Rolling friction is _____ sliding friction.', ['equal to', 'greater than', 'less than', 'unrelated to'], 2),
    Q('phy', '9', 2, 'mcq', 'A force of 20 N acts on a 4 kg mass. The acceleration produced is:', ['80 m/s²', '0.2 m/s²', '5 m/s²', '24 m/s²'], 2),
    Q('phy', '9', 2, 'short', 'State Newton’s second law of motion and write its mathematical form.', null, null, 'When a net force acts on a body it produces an acceleration in the direction of the force, directly proportional to the force and inversely proportional to the mass: F = ma.'),
    Q('phy', '9', 2, 'short', 'Why does a passenger fall forward when a bus stops suddenly?', null, null, 'Due to inertia: the lower body stops with the bus while the upper body tends to keep moving forward.'),
    Q('phy', '9', 2, 'short', 'Define momentum. Find the momentum of a 2 kg ball moving at 5 m/s.', null, null, 'Momentum is the product of mass and velocity, p = mv. p = 2 × 5 = 10 kg m/s.'),
    Q('phy', '9', 2, 'long', 'State and prove the law of conservation of momentum.', null, null, 'In an isolated system the total momentum before collision equals the total momentum after it. Proof: for two bodies colliding, by Newton’s third law F₁ = −F₂; impulses are equal and opposite over the same time, so m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂.'),
    // 10th Chemistry Ch2 Acids, bases, salts
    Q('chem', '10', 1, 'mcq', 'According to Arrhenius, a base produces which ion in water?', ['H⁺', 'OH⁻', 'Na⁺', 'Cl⁻'], 1),
    Q('chem', '10', 1, 'mcq', 'The pH of a neutral solution at 25 °C is:', ['0', '7', '14', '1'], 1),
    Q('chem', '10', 1, 'mcq', 'Which of these is a strong acid?', ['CH₃COOH', 'H₂CO₃', 'HCl', 'H₂S'], 2),
    Q('chem', '10', 1, 'short', 'Define Lewis acid and Lewis base with one example each.', null, null, 'Lewis acid: electron-pair acceptor, e.g. BF₃. Lewis base: electron-pair donor, e.g. NH₃.'),
    Q('chem', '10', 1, 'short', 'What is a salt? Give two uses of sodium chloride.', null, null, 'A salt is an ionic compound formed by neutralisation of an acid with a base. NaCl: food preservation and seasoning; manufacture of NaOH, Cl₂ and Na₂CO₃.'),
    Q('chem', '10', 1, 'long', 'Explain the Brønsted–Lowry concept of acids and bases with examples, and identify the conjugate acid–base pairs in NH₃ + H₂O ⇌ NH₄⁺ + OH⁻.', null, null, 'Acid = proton donor, base = proton acceptor. H₂O donates a proton (acid), NH₃ accepts (base). Pairs: H₂O/OH⁻ and NH₄⁺/NH₃.'),
    // 11th Physics Ch1 Measurements
    Q('phy', '11', 0, 'mcq', 'The dimensions of pressure are:', ['[MLT⁻²]', '[ML⁻¹T⁻²]', '[ML²T⁻²]', '[MLT⁻¹]'], 1),
    Q('phy', '11', 0, 'mcq', 'Random errors can be reduced by:', ['using a better instrument', 'taking many readings and averaging', 'calibrating the instrument', 'none of these'], 1),
    Q('phy', '11', 0, 'short', 'Distinguish between systematic and random errors.', null, null, 'Systematic errors have the same size and sign every time (e.g. zero error) and are reduced by calibration; random errors vary unpredictably and are reduced by averaging repeated readings.'),
    Q('phy', '11', 0, 'short', 'Check the dimensional correctness of v = u + at.', null, null, 'Each term has dimensions [LT⁻¹]: [LT⁻²][T] = [LT⁻¹]. The equation is dimensionally correct.'),
    // B.Com I Financial Accounting Ch2 Journal
    Q('facc', 'bcom1', 1, 'mcq', 'Purchase of furniture for cash is recorded by:', ['Debit Furniture, Credit Cash', 'Debit Cash, Credit Furniture', 'Debit Purchases, Credit Cash', 'Debit Furniture, Credit Capital'], 0),
    Q('facc', 'bcom1', 1, 'mcq', 'The book of original entry is the:', ['Ledger', 'Trial balance', 'Journal', 'Balance sheet'], 2),
    Q('facc', 'bcom1', 1, 'mcq', 'Under the double-entry system every transaction affects:', ['one account', 'at least two accounts', 'only cash', 'the capital account only'], 1),
    Q('facc', 'bcom1', 3, 'mcq', 'A trial balance is prepared to check:', ['profit', 'arithmetical accuracy of the ledger', 'cash in hand', 'the value of assets'], 1),
    Q('facc', 'bcom1', 1, 'short', 'Define journal. Why is it called the book of original entry?', null, null, 'The journal is the book in which transactions are first recorded in chronological order with debit and credit; it is the original record from which ledger accounts are posted.'),
    Q('facc', 'bcom1', 1, 'long', 'Journalise the following: (i) Started business with cash Rs 500,000. (ii) Purchased goods for cash Rs 80,000. (iii) Sold goods to Ahmed on credit Rs 30,000. (iv) Paid rent Rs 10,000. (v) Received Rs 29,000 from Ahmed in full settlement.', null, null, '(i) Cash Dr 500,000 / Capital Cr 500,000. (ii) Purchases Dr 80,000 / Cash Cr 80,000. (iii) Ahmed Dr 30,000 / Sales Cr 30,000. (iv) Rent Dr 10,000 / Cash Cr 10,000. (v) Cash Dr 29,000, Discount allowed Dr 1,000 / Ahmed Cr 30,000.'),
  ];
  // ---- SAMPLE PAST PAPERS (demo): built from the bank; real ones are typed/imported in Admin
  const pick = (subject, level, type, k, seed) => { const pool = BANK.filter(q => q.subject === subject && q.level === level && q.type === type); const out = []; for (let i = 0; i < k && pool.length; i++) out.push(pool[(seed + i * 7) % pool.length].id); return [...new Set(out)]; };
  const paper = (id, board, level, subject, year, group, seed) => ({ id, board, level, subject, year, group, sample: true, title: `${year} · Group ${group}`, pdf: null,
    sections: [{ key: 'obj', title: 'Objective · MCQs', qs: pick(subject, level, 'mcq', 12, seed) }, { key: 'short', title: 'Subjective · Short questions', qs: pick(subject, level, 'short', 8, seed) }, { key: 'long', title: 'Subjective · Long questions', qs: pick(subject, level, 'long', 3, seed) }] });
  const PAPERS = [
    paper('p1', 'lhr', '9', 'phy', 2025, 'I', 0), paper('p2', 'lhr', '9', 'phy', 2025, 'II', 3), paper('p3', 'lhr', '9', 'phy', 2024, 'I', 5), paper('p4', 'grw', '9', 'phy', 2025, 'I', 2), paper('p5', 'grw', '9', 'phy', 2024, 'II', 4),
    paper('p6', 'lhr', '10', 'chem', 2025, 'I', 0), paper('p7', 'grw', '10', 'chem', 2024, 'I', 1),
    paper('p8', 'lhr', '11', 'phy', 2025, 'I', 0), paper('p9', 'grw', '11', 'phy', 2025, 'II', 1),
    paper('p10', 'pu', 'bcom1', 'facc', 2025, 'A', 0), paper('p11', 'pu', 'bcom1', 'facc', 2024, 'A', 2),
  ];
  const PLANS = [
    { id: 'm', name: 'Monthly', price: 499, days: 31, blurb: 'All papers of your class & board, paper generator, progress' },
    { id: 'y', name: 'Exam year', price: 2999, days: 365, blurb: 'Everything, for the whole session — best value', best: true },
  ];
  const PAY = { jazzcash: '0300-0000000', easypaisa: '0300-0000000', bank: 'Azhar Publishers · Meezan Bank · PK00MEZN0000000000000000', whatsapp: '923000000000' };
  return { BOARDS, LEVELS, GROUPS, SUBJECTS, PATTERNS, CHAPTERS, BANK, PAPERS, PLANS, PAY };
})();
