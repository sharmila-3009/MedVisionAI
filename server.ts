import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '20mb' }));

// Initialize Google GenAI client if key is available
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Error initializing GoogleGenAI:', err);
  }
}

// In-Memory Database for Demo/Production runtime
let userProfile = {
  id: 'usr_101',
  name: 'Mary Jenkins',
  age: 74,
  blood_group: 'O+',
  emergency_contact: 'Sarah Jenkins (Daughter) - (555) 019-2834',
  allergies: ['Penicillin', 'Sulfa drugs'],
  medical_conditions: ['Hypertension', 'Type 2 Diabetes'],
  current_medicines: ['Lisinopril 10mg', 'Metformin 500mg', 'Vitamin D3 1000IU'],
  caregiver_email: 'sarah.jenkins@family.care',
};

let scanHistory = [
  {
    id: 'scan_1',
    medicine_name: 'Paracetamol 500mg',
    generic_name: 'Acetaminophen',
    dosage: '1 tablet (500mg) after meals',
    timing: { morning: true, afternoon: true, night: false, notes: 'Take every 6 hours as needed' },
    uses: 'Used for fever reduction and mild to moderate pain relief.',
    expiry: '08/2027',
    expiry_status: 'Valid',
    side_effects: ['Mild stomach discomfort', 'Nausea'],
    warning: 'Do not exceed 4 tablets in 24 hours. Avoid alcohol.',
    drug_interactions: 'No severe interaction with current medications (Lisinopril/Metformin).',
    scan_time: '2026-07-27T09:30:00Z',
    image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    confidence: '98.4%',
  },
  {
    id: 'scan_2',
    medicine_name: 'Metformin HCl 500mg',
    generic_name: 'Metformin Hydrochloride',
    dosage: '1 tablet twice daily with food',
    timing: { morning: true, afternoon: false, night: true, notes: 'Take with morning and evening meal' },
    uses: 'Manages blood sugar levels in Type 2 Diabetes.',
    expiry: '11/2026',
    expiry_status: 'Valid',
    side_effects: ['Mild stomach upset', 'Loss of appetite'],
    warning: 'Take with meals to minimize stomach upset. Stay well hydrated.',
    drug_interactions: 'Already in your active prescription profile. Do not double dose.',
    scan_time: '2026-07-26T14:15:00Z',
    image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&auto=format&fit=crop&q=80',
    confidence: '99.1%',
  },
  {
    id: 'scan_3',
    medicine_name: 'Amoxicillin 250mg',
    generic_name: 'Amoxicillin Trihydrate',
    dosage: '1 capsule every 8 hours',
    timing: { morning: true, afternoon: true, night: true, notes: 'Complete full 7-day course' },
    uses: 'Antibiotic for bacterial infections.',
    expiry: '03/2026',
    expiry_status: 'Expiring Soon',
    side_effects: ['Diarrhea', 'Rash', 'Nausea'],
    warning: 'CRITICAL ALLERGY ALERT: You are registered allergic to Penicillin derivatives!',
    drug_interactions: 'HIGH RISK ALERT: Amoxicillin is a penicillin antibiotic. Contradicted by profile allergies!',
    scan_time: '2026-07-25T18:00:00Z',
    image_url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300&auto=format&fit=crop&q=80',
    confidence: '96.8%',
  },
];

let reminders = [
  {
    id: 'rem_1',
    medicine_name: 'Lisinopril 10mg',
    dosage: '1 Tablet',
    time_slot: 'Morning',
    time_exact: '08:00 AM',
    status: 'Completed',
    notes: 'For blood pressure - take with water',
    date: '2026-07-28',
  },
  {
    id: 'rem_2',
    medicine_name: 'Metformin 500mg',
    dosage: '1 Tablet',
    time_slot: 'Morning',
    time_exact: '08:30 AM',
    status: 'Completed',
    notes: 'Take during or right after breakfast',
    date: '2026-07-28',
  },
  {
    id: 'rem_3',
    medicine_name: 'Vitamin D3 1000IU',
    dosage: '1 Softgel',
    time_slot: 'Afternoon',
    time_exact: '01:00 PM',
    status: 'Pending',
    notes: 'Daily dietary supplement',
    date: '2026-07-28',
  },
  {
    id: 'rem_4',
    medicine_name: 'Metformin 500mg',
    dosage: '1 Tablet',
    time_slot: 'Night',
    time_exact: '08:00 PM',
    status: 'Pending',
    notes: 'Take during or right after dinner',
    date: '2026-07-28',
  },
];

// Caregiver / Family Monitoring Log
let familyMonitoringData = {
  elderly_name: 'Mary Jenkins',
  compliance_rate: 92,
  weekly_adherence: [
    { day: 'Mon', taken: 4, missed: 0 },
    { day: 'Tue', taken: 4, missed: 0 },
    { day: 'Wed', taken: 3, missed: 1 },
    { day: 'Thu', taken: 4, missed: 0 },
    { day: 'Fri', taken: 4, missed: 0 },
    { day: 'Sat', taken: 4, missed: 0 },
    { day: 'Sun', taken: 2, missed: 0 }, // Today so far
  ],
  todays_schedule: [
    { medicine: 'Lisinopril 10mg', time: '08:00 AM', status: 'Completed', time_taken: '08:05 AM' },
    { medicine: 'Metformin 500mg', time: '08:30 AM', status: 'Completed', time_taken: '08:28 AM' },
    { medicine: 'Vitamin D3', time: '01:00 PM', status: 'Pending', time_taken: null },
    { medicine: 'Metformin 500mg', time: '08:00 PM', status: 'Pending', time_taken: null },
  ],
  recent_alerts: [
    { id: 'alt_1', level: 'warning', message: 'Amoxicillin scan attempt flagged due to registered Penicillin allergy.', timestamp: 'Yesterday, 6:00 PM' },
    { id: 'alt_2', level: 'info', message: 'Morning medications taken on schedule.', timestamp: 'Today, 8:28 AM' },
  ]
};

// Default sample medicine responses if camera produces low light or AI key fallback is triggered
const sampleMedicines = [
  {
    medicine_name: 'Paracetamol Extra 500mg',
    generic_name: 'Acetaminophen & Caffeine',
    dosage: '1 Tablet every 6 hours as needed',
    timing: { morning: true, afternoon: true, night: false, notes: 'Take after meals with plenty of water.' },
    uses: 'Fast-acting relief from headaches, fever, muscle aches, and mild arthritis pain.',
    expiry: '09/2027',
    expiry_status: 'Valid',
    side_effects: ['Mild restlessness (caffeine)', 'Stomach upset if taken on empty stomach'],
    warning: 'Do not exceed 4 tablets per 24 hours. Keep out of reach of children.',
    drug_interactions: 'Safe with current medications. Avoid consuming excessive coffee or tea.',
    speech_summary: 'This is Paracetamol Extra 500 milligram. Take one tablet after food in the morning or afternoon. It relieves headache and fever.',
  },
  {
    medicine_name: 'Lisinopril 10mg',
    generic_name: 'Lisinopril ACE Inhibitor',
    dosage: '1 Tablet once daily in the morning',
    timing: { morning: true, afternoon: false, night: false, notes: 'Take consistently at the same time every morning.' },
    uses: 'Lowers blood pressure to prevent heart attacks, strokes, and kidney problems.',
    expiry: '04/2028',
    expiry_status: 'Valid',
    side_effects: ['Dry cough', 'Mild dizziness when standing up quickly'],
    warning: 'Do not discontinue without consulting your cardiologist. Monitor blood pressure weekly.',
    drug_interactions: 'Matches existing prescription profile. Avoid potassium supplements unless advised.',
    speech_summary: 'This is Lisinopril 10 milligram. Take one tablet every morning for blood pressure. Stand up slowly if you feel slightly dizzy.',
  },
  {
    medicine_name: 'Atorvastatin 20mg',
    generic_name: 'Atorvastatin Calcium (Lipitor)',
    dosage: '1 Tablet once daily at night',
    timing: { morning: false, afternoon: false, night: true, notes: 'Best taken before sleep for optimal lipid regulation.' },
    uses: 'Lowers bad cholesterol (LDL) and triglycerides, boosting heart cardiovascular health.',
    expiry: '12/2027',
    expiry_status: 'Valid',
    side_effects: ['Mild muscle discomfort', 'Joint stiffness'],
    warning: 'Avoid consuming grapefruit or grapefruit juice while on atorvastatin.',
    drug_interactions: 'Compatible with Lisinopril and Metformin. No acute interaction detected.',
    speech_summary: 'This is Atorvastatin 20 milligram. Take one tablet at night before bed. It helps lower cholesterol. Avoid grapefruit juice.',
  },
];

// API Routes

// 1. Scan Medicine API
app.post('/api/scan-medicine', async (req: Request, res: Response) => {
  try {
    const { imageBase64, sampleId } = req.body;

    if (sampleId) {
      const selected = sampleMedicines[parseInt(sampleId) % sampleMedicines.length];
      const newScan = {
        id: `scan_${Date.now()}`,
        ...selected,
        scan_time: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
        confidence: '97.8%',
      };
      scanHistory.unshift(newScan);
      return res.json({ success: true, medicine: newScan });
    }

    if (!imageBase64) {
      return res.status(400).json({ error: 'No camera frame image provided' });
    }

    // Determine mimeType
    let mimeType = 'image/jpeg';
    if (imageBase64.startsWith('data:image/png')) {
      mimeType = 'image/png';
    } else if (imageBase64.startsWith('data:image/webp')) {
      mimeType = 'image/webp';
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    if (ai) {
      try {
        const startTime = Date.now();
        const promptText = `You are MedVision AI, an expert clinical pharmaceutical vision recognition engine.
TASK: Inspect this image and identify the exact medicine, tablet, pill, blister pack, strip, box, or prescription bottle shown.

STRICT CLINICAL RULES:
1. OPTICAL CHARACTER RECOGNITION (OCR): Read all printed characters on packaging, blister foil, box, or prescription label. Identify:
   - Exact Brand Name and active chemical compound (e.g., "Amoxicillin", "Metformin", "Paracetamol", "Ibuprofen", "Omeprazole", "Alerid", "Pantoprazole", "Atorvastatin", "Dolo 650", "Azithromycin", etc.)
   - Exact strength (e.g. 500mg, 10mg, 20mg, 650mg, 5ml)
   - Expiration date or Batch number if visible.
2. PHYSICAL TABLET / PILL IDENTIFICATION: If loose tablets, pills, or capsules are shown:
   - Identify any engraved/printed imprints (letters, numbers, logos, score lines).
   - Analyze pill shape (round, oval, capsule, caplet), color, and coating.
   - Identify the specific medication matching those exact physical features.
3. ABSOLUTE TRUTHFULNESS: Do NOT guess or hallucinate. Do NOT assume it is one of the patient's existing medications unless that exact medicine is visible.
4. UNIDENTIFIABLE / UNCLEAR ITEMS: If the image does not show a medicine or the text/imprint is too blurry or cut off to verify safely, set "identified": false, "medicine_name": "Unclear Medicine / Label Unreadable", and instruct the user in "uses" and "warning" to hold the strip closer with the printed side facing the camera.

PATIENT PROFILE (FOR DRUG INTERACTION & ALLERGY CHECKING ONLY):
- Known Allergies: ${userProfile.allergies.join(', ') || 'None reported'}
- Existing Medications: ${userProfile.current_medicines.join(', ') || 'None reported'}
- Health Conditions: ${userProfile.medical_conditions.join(', ') || 'None reported'}

Return a valid JSON object strictly matching this schema:
{
  "identified": false,
  "medicine_name": "Exact Name with strength, or 'Unclear Medicine / Label Unreadable'",
  "generic_name": "Active generic chemical compound or physical pill description",
  "dosage": "Clear elder-friendly dosage instruction",
  "timing": {
    "morning": false,
    "afternoon": false,
    "night": false,
    "notes": "Timing guidance"
  },
  "uses": "Primary therapeutic purpose of this medication",
  "expiry": "MM/YYYY or 'Unspecified'",
  "expiry_status": "Valid",
  "side_effects": ["Side effect 1", "Side effect 2"],
  "warning": "Key safety warning or guidance to reposition strip",
  "drug_interactions": "Specific evaluation regarding patient profile (${userProfile.current_medicines.join(', ')}) and allergies (${userProfile.allergies.join(', ')})",
  "speech_summary": "Two short spoken sentences for elder voice readout",
  "confidence": "High (98%)"
}`;

        const imagePart = {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        };

        let response;
        // Avoid models with exhausted token quotas (e.g. gemini-3.8-flash)
        const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
        let lastError = null;

        for (const modelName of candidateModels) {
          try {
            response = await ai.models.generateContent({
              model: modelName,
              contents: { parts: [imagePart, { text: promptText }] },
              config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              },
            });
            if (response && response.text) {
              break;
            }
          } catch (modelErr: any) {
            console.warn(`Model ${modelName} failed or unavailable:`, modelErr?.message || modelErr);
            lastError = modelErr;
          }
        }

        const elapsedMs = Date.now() - startTime;
        console.log(`Gemini Vision analysis completed in ${elapsedMs}ms`);

        if (response && response.text) {
          const parsed = JSON.parse(response.text);
          const isIdentified = parsed.identified !== false && !parsed.medicine_name?.toLowerCase().includes('unclear') && !parsed.medicine_name?.toLowerCase().includes('unidentified');

          const newScan = {
            id: `scan_${Date.now()}`,
            ...parsed,
            identified: isIdentified,
            scan_time: new Date().toISOString(),
            image_url: imageBase64,
            confidence: parsed.confidence || (isIdentified ? '98.2%' : 'Low / Re-scan advised'),
            latencyMs: elapsedMs,
          };
          scanHistory.unshift(newScan);
          return res.json({ success: true, medicine: newScan, latencyMs: elapsedMs });
        } else if (lastError) {
          throw lastError;
        }
      } catch (geminiError: any) {
        console.error('Gemini Vision AI scan error:', geminiError);
        return res.status(500).json({
          error: 'AI vision recognition service encountered a temporary error. Please tap Scan again.',
          details: geminiError?.message || 'Vision model unavailable',
        });
      }
    } else {
      console.warn('GoogleGenAI client not initialized. GEMINI_API_KEY may be missing or invalid.');
      return res.status(500).json({ error: 'AI key not configured on server.' });
    }

  } catch (error: any) {
    console.error('Scan API handler error:', error);
    res.status(500).json({ error: 'Failed to process medicine scan' });
  }
});

// 2. Scan History API
app.get('/api/medicine-history', (req: Request, res: Response) => {
  res.json({ success: true, history: scanHistory });
});

app.delete('/api/medicine-history/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  scanHistory = scanHistory.filter((item) => item.id !== id);
  res.json({ success: true, history: scanHistory });
});

// 3. Reminders API
app.get('/api/reminders', (req: Request, res: Response) => {
  res.json({ success: true, reminders });
});

app.post('/api/reminders', (req: Request, res: Response) => {
  const newReminder = {
    id: `rem_${Date.now()}`,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0],
    ...req.body,
  };
  reminders.push(newReminder);
  res.json({ success: true, reminder: newReminder, reminders });
});

app.put('/api/reminders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = reminders.findIndex((r) => r.id === id);
  if (index !== -1) {
    reminders[index] = { ...reminders[index], ...req.body };
    return res.json({ success: true, reminder: reminders[index], reminders });
  }
  res.status(404).json({ error: 'Reminder not found' });
});

app.delete('/api/reminders/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  reminders = reminders.filter((r) => r.id !== id);
  res.json({ success: true, reminders });
});

// 4. User Profile API
app.get('/api/user-profile', (req: Request, res: Response) => {
  res.json({ success: true, profile: userProfile });
});

app.put('/api/user-profile', (req: Request, res: Response) => {
  userProfile = { ...userProfile, ...req.body };
  res.json({ success: true, profile: userProfile });
});

// 5. Elderly Family Caregiver Monitoring API
app.get('/api/family-monitoring', (req: Request, res: Response) => {
  res.json({ success: true, monitoring: familyMonitoringData });
});

// 6. Drug Interaction Checker Route
app.post('/api/drug-interaction-check', async (req: Request, res: Response) => {
  const { medicine_name, generic_name } = req.body;

  let hasAllergyAlert = false;
  let alertMessage = '';

  const lowerName = (medicine_name + ' ' + (generic_name || '')).toLowerCase();

  for (const allergy of userProfile.allergies) {
    if (lowerName.includes(allergy.toLowerCase()) || (allergy.toLowerCase().includes('penicillin') && (lowerName.includes('amoxicillin') || lowerName.includes('ampicillin')))) {
      hasAllergyAlert = true;
      alertMessage = `CRITICAL WARNING: User is allergic to ${allergy}! Do not consume ${medicine_name}.`;
      break;
    }
  }

  res.json({
    hasAllergyAlert,
    alertMessage,
    current_meds: userProfile.current_medicines,
    known_allergies: userProfile.allergies,
  });
});

// Serve frontend in production or dev environment
const PORT = process.env.PORT || 3000;

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(` MedVision AI Full-Stack Server running on port ${PORT}`);
  });
}

startServer();
