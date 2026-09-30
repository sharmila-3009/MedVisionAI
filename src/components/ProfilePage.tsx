import React, { useState } from 'react';
import { User, ShieldAlert, Heart, Plus, Trash2, CheckCircle2, Phone, Mail, AlertTriangle, FileText } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfilePageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  accessibilityMode: boolean;
  speakText: (text: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  onUpdateProfile,
  accessibilityMode,
  speakText,
}) => {
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMed, setNewMed] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Profile Edit States
  const [name, setName] = useState(userProfile.name);
  const [age, setAge] = useState(userProfile.age);
  const [bloodGroup, setBloodGroup] = useState(userProfile.blood_group);
  const [emergencyContact, setEmergencyContact] = useState(userProfile.emergency_contact);

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    const updated = {
      ...userProfile,
      allergies: [...userProfile.allergies, newAllergy.trim()],
    };
    onUpdateProfile(updated);
    setNewAllergy('');
    speakText(`Added ${newAllergy} to allergy registry`);
  };

  const handleRemoveAllergy = (index: number) => {
    const updatedAllergies = userProfile.allergies.filter((_, i) => i !== index);
    onUpdateProfile({ ...userProfile, allergies: updatedAllergies });
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    const updated = {
      ...userProfile,
      medical_conditions: [...userProfile.medical_conditions, newCondition.trim()],
    };
    onUpdateProfile(updated);
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    const updated = userProfile.medical_conditions.filter((_, i) => i !== index);
    onUpdateProfile({ ...userProfile, medical_conditions: updated });
  };

  const handleAddMedicine = () => {
    if (!newMed.trim()) return;
    const updated = {
      ...userProfile,
      current_medicines: [...userProfile.current_medicines, newMed.trim()],
    };
    onUpdateProfile(updated);
    setNewMed('');
  };

  const handleRemoveMedicine = (index: number) => {
    const updated = userProfile.current_medicines.filter((_, i) => i !== index);
    onUpdateProfile({ ...userProfile, current_medicines: updated });
  };

  const handleSaveGeneralInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...userProfile,
      name,
      age: Number(age),
      blood_group: bloodGroup,
      emergency_contact: emergencyContact,
    });
    setSavedSuccess(true);
    speakText('Health profile updated successfully');
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${accessibilityMode ? 'text-lg' : 'text-base'}`}>
      
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Personal Medical Profile
        </h1>
        <p className="text-slate-600 mt-1">
          Store your allergies, existing health conditions, and current prescriptions for AI cross-checking.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Info Form */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
              {name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 font-heading">{name}</h3>
              <p className="text-sm font-semibold text-slate-500">Age: {age} • Blood: {bloodGroup}</p>
            </div>
          </div>

          <form onSubmit={handleSaveGeneralInfo} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Full Patient Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group
                </label>
                <input
                  type="text"
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                Primary Emergency Contact
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{savedSuccess ? '✓ Profile Saved' : 'Save General Details'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Allergies, Conditions & Current Prescriptions */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Registered Allergies Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-red-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-red-900 font-heading flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>Known Drug & Substance Allergies</span>
              </h3>
              <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                AI Cross-Check Guard
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {userProfile.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-red-100 text-red-900 border border-red-300 rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  <span>{allergy}</span>
                  <button
                    onClick={() => handleRemoveAllergy(idx)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add new allergy (e.g. Aspirin)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleAddAllergy}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Existing Medical Conditions */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span>Existing Medical Conditions</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {userProfile.medical_conditions.map((cond, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl font-bold text-xs flex items-center gap-2"
                >
                  <span>{cond}</span>
                  <button onClick={() => handleRemoveCondition(idx)} className="hover:text-blue-600">×</button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add condition (e.g. Asthma)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCondition}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Ongoing Medications */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900 font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>Current Ongoing Prescriptions</span>
            </h3>

            <div className="space-y-2">
              {userProfile.current_medicines.map((med, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-bold text-slate-800"
                >
                  <span>{med}</span>
                  <button onClick={() => handleRemoveMedicine(idx)} className="text-slate-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                value={newMed}
                onChange={(e) => setNewMed(e.target.value)}
                placeholder="Add ongoing medication..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddMedicine}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Add
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
