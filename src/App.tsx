/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { ScannerPage } from './components/ScannerPage';
import { HistoryPage } from './components/HistoryPage';
import { ReminderPage } from './components/ReminderPage';
import { FamilyDashboard } from './components/FamilyDashboard';
import { ProfilePage } from './components/ProfilePage';
import { Footer } from './components/Footer';
import { MedicineScan, ReminderItem, UserProfile, FamilyMonitoringData } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [accessibilityMode, setAccessibilityMode] = useState<boolean>(false);

  // Core Data States
  const [history, setHistory] = useState<MedicineScan[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_101',
    name: 'Mary Jenkins',
    age: 74,
    blood_group: 'O+',
    emergency_contact: 'Sarah Jenkins (Daughter) - (555) 019-2834',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medical_conditions: ['Hypertension', 'Type 2 Diabetes'],
    current_medicines: ['Lisinopril 10mg', 'Metformin 500mg', 'Vitamin D3 1000IU'],
    caregiver_email: 'sarah.jenkins@family.care',
  });

  const [monitoringData, setMonitoringData] = useState<FamilyMonitoringData>({
    elderly_name: 'Mary Jenkins',
    compliance_rate: 92,
    weekly_adherence: [
      { day: 'Mon', taken: 4, missed: 0 },
      { day: 'Tue', taken: 4, missed: 0 },
      { day: 'Wed', taken: 3, missed: 1 },
      { day: 'Thu', taken: 4, missed: 0 },
      { day: 'Fri', taken: 4, missed: 0 },
      { day: 'Sat', taken: 4, missed: 0 },
      { day: 'Sun', taken: 2, missed: 0 },
    ],
    todays_schedule: [
      { medicine: 'Lisinopril 10mg', time: '08:00 AM', status: 'Completed', time_taken: '08:05 AM' },
      { medicine: 'Metformin 500mg', time: '08:30 AM', status: 'Completed', time_taken: '08:28 AM' },
      { medicine: 'Vitamin D3 1000IU', time: '01:00 PM', status: 'Pending', time_taken: null },
      { medicine: 'Metformin 500mg', time: '08:00 PM', status: 'Pending', time_taken: null },
    ],
    recent_alerts: [
      { id: 'alt_1', level: 'warning', message: 'Amoxicillin scan attempt flagged due to registered Penicillin allergy.', timestamp: 'Yesterday, 6:00 PM' },
      { id: 'alt_2', level: 'info', message: 'Morning medications taken on schedule.', timestamp: 'Today, 8:28 AM' },
    ],
  });

  // Voice Assistant Text-To-Speech helper
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // cancel previous utterances
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower, clear speech for elderly users
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch initial data from Express backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [histRes, remRes, profRes, famRes] = await Promise.all([
          fetch('/api/medicine-history').then((r) => r.json()).catch(() => null),
          fetch('/api/reminders').then((r) => r.json()).catch(() => null),
          fetch('/api/user-profile').then((r) => r.json()).catch(() => null),
          fetch('/api/family-monitoring').then((r) => r.json()).catch(() => null),
        ]);

        if (histRes?.history) setHistory(histRes.history);
        if (remRes?.reminders) setReminders(remRes.reminders);
        if (profRes?.profile) setUserProfile(profRes.profile);
        if (famRes?.monitoring) setMonitoringData(famRes.monitoring);
      } catch (err) {
        console.warn('Error loading backend API data:', err);
      }
    }
    loadBackendData();
  }, []);

  // Handlers
  const handleAddReminderFromScan = (medicineName: string, dosage: string, timing: any) => {
    const slot = timing?.morning ? 'Morning' : timing?.afternoon ? 'Afternoon' : 'Night';
    const newRem: ReminderItem = {
      id: `rem_${Date.now()}`,
      medicine_name: medicineName,
      dosage: dosage || '1 Tablet',
      time_slot: slot,
      time_exact: slot === 'Morning' ? '08:00 AM' : slot === 'Afternoon' ? '01:00 PM' : '08:00 PM',
      status: 'Pending',
      notes: 'Added from AI scan',
      date: new Date().toISOString().split('T')[0],
    };

    setReminders((prev) => [...prev, newRem]);
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRem),
    }).catch(console.error);
  };

  const handleCreateReminderManual = (newRemData: Omit<ReminderItem, 'id' | 'status' | 'date'>) => {
    const newRem: ReminderItem = {
      id: `rem_${Date.now()}`,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      ...newRemData,
    };
    setReminders((prev) => [...prev, newRem]);
    fetch('/api/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRem),
    }).catch(console.error);
  };

  const handleToggleReminderStatus = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextStatus = r.status === 'Completed' ? 'Pending' : 'Completed';
          fetch(`/api/reminders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus }),
          }).catch(console.error);
          return { ...r, status: nextStatus };
        }
        return r;
      })
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
    fetch(`/api/reminders/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleDeleteScanRecord = (id: string) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    fetch(`/api/medicine-history/${id}`, { method: 'DELETE' }).catch(console.error);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    fetch('/api/user-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProfile),
    }).catch(console.error);
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col selection:bg-blue-500 selection:text-white ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        accessibilityMode={accessibilityMode}
        setAccessibilityMode={setAccessibilityMode}
        speakText={speakText}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {activeTab === 'landing' && (
          <LandingPage
            onStartScanning={() => setActiveTab('scanner')}
            onExploreReminders={() => setActiveTab('reminders')}
            speakText={speakText}
          />
        )}

        {activeTab === 'scanner' && (
          <ScannerPage
            onAddReminder={handleAddReminderFromScan}
            userProfile={userProfile}
            speakText={speakText}
            accessibilityMode={accessibilityMode}
          />
        )}

        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            onDeleteScan={handleDeleteScanRecord}
            accessibilityMode={accessibilityMode}
            speakText={speakText}
          />
        )}

        {activeTab === 'reminders' && (
          <ReminderPage
            reminders={reminders}
            onAddReminder={handleCreateReminderManual}
            onToggleStatus={handleToggleReminderStatus}
            onDeleteReminder={handleDeleteReminder}
            accessibilityMode={accessibilityMode}
            speakText={speakText}
          />
        )}

        {activeTab === 'family' && (
          <FamilyDashboard
            monitoringData={monitoringData}
            accessibilityMode={accessibilityMode}
            speakText={speakText}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            userProfile={userProfile}
            onUpdateProfile={handleUpdateProfile}
            accessibilityMode={accessibilityMode}
            speakText={speakText}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
