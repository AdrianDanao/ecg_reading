import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  medicalHistory: string[];
  medications: string[];
  createdAt: string;
}

interface Prediction {
  _id: string;
  device_id: string;
  Platform: string;
  timestamp: string;
  label: string;
  confidence_percent: number;
  all_class_probabilities: {
    Normal: number;
    "Heart Attack": number;
  };
  value: number[];
}

interface PatientWithPrediction extends Patient {
  prediction?: Prediction;
  bpm?: number;
  status: 'stable' | 'critical';
}

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithPrediction | null>(null);
  const [patients, setPatients] = useState<PatientWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch patients
        const patientsResponse = await fetch(`${API_BASE_URL}/patients`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!patientsResponse.ok) {
          throw new Error(`HTTP error! status: ${patientsResponse.status}`);
        }

        const patientsData: Patient[] = await patientsResponse.json();

        // Fetch latest prediction for each patient
        const patientsWithPredictions = await Promise.all(
          patientsData.map(async (patient) => {
            try {
              const predictionResponse = await fetch(`${API_BASE_URL}/predictions/${patient._id}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                credentials: 'include'
              });

              if (!predictionResponse.ok) {
                console.warn(`No prediction found for patient ${patient._id}`);
                return {
                  ...patient,
                  status: 'stable' as const,
                  bpm: 0
                };
              }

              const prediction: Prediction = await predictionResponse.json();

              // Calculate BPM (simplified - in real app, this would be calculated from the ECG data)
              const bpm = Math.floor(Math.random() * 30) + 60; // Placeholder calculation

              // Determine status based on prediction
              const status: 'stable' | 'critical' = prediction.label === "Heart Attack" || 
                            prediction.confidence_percent > 80 ? 'critical' : 'stable';

              return {
                ...patient,
                prediction,
                bpm,
                status
              };
            } catch (error) {
              console.warn(`Error fetching prediction for patient ${patient._id}:`, error);
              return {
                ...patient,
                status: 'stable' as const,
                bpm: 0
              };
            }
          })
        );

        setPatients(patientsWithPredictions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
        // You might want to set an error state here to show to the user
      }
    };

    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const handlePatientInfo = (patient: PatientWithPrediction) => {
    setSelectedPatient(patient);
    setShowPatientModal(true);
  };

  const handleSendAmbulance = (patientId: string) => {
    // Simulate emergency response
    alert(`Ambulance dispatched for patient ${patientId}`);
  };

  if (loading) {
    return <div className="loading">Loading patient data...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">HeartGuard.UI</div>
        <div className="nav-user">
          <button 
            className="user-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            Dr. Smith
          </button>
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => {}}>Profile</button>
              <button onClick={() => {}}>Settings</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="patient-grid">
          {patients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-header">
                <h3>{patient.name}</h3>
                <span className={`status-badge ${patient.status}`}>
                  {patient.status}
                </span>
              </div>
              <div className="ecg-container">
                {patient.prediction && (
                  <svg className="ecg-graph" viewBox="0 0 100 20">
                    {patient.prediction.value.map((value, index) => (
                      <line
                        key={index}
                        x1={index * 2}
                        y1={10 + value * 5}
                        x2={(index + 1) * 2}
                        y2={10 + patient.prediction!.value[index + 1] * 5}
                        stroke={patient.status === 'critical' ? '#EF4444' : '#4ADE80'}
                        strokeWidth="0.5"
                      />
                    ))}
                  </svg>
                )}
              </div>
              <div className="patient-vitals">
                <div className="bpm">
                  <span className="bpm-icon">❤️</span>
                  <span>{patient.bpm} BPM</span>
                </div>
              </div>
              <div className="patient-actions">
                <button 
                  className="action-button emergency"
                  onClick={() => handleSendAmbulance(patient._id)}
                >
                  Send Ambulance
                </button>
                <button 
                  className="action-button info"
                  onClick={() => handlePatientInfo(patient)}
                >
                  Check Patient Info
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showPatientModal && selectedPatient && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{selectedPatient.name}'s Details</h2>
            <div className="modal-body">
              <p>Age: {selectedPatient.age}</p>
              <p>Gender: {selectedPatient.gender}</p>
              <p>Blood Type: {selectedPatient.bloodType}</p>
              <p>Contact: {selectedPatient.contactNumber}</p>
              <p>Emergency Contact: {selectedPatient.emergencyContact}</p>
              {selectedPatient.prediction && (
                <div className="ai-insights">
                  <h3>AI Analysis</h3>
                  <p>Latest Prediction: {selectedPatient.prediction.label}</p>
                  <p>Confidence: {selectedPatient.prediction.confidence_percent.toFixed(1)}%</p>
                  <div className="probability-breakdown">
                    <p>Normal: {(selectedPatient.prediction.all_class_probabilities.Normal * 100).toFixed(1)}%</p>
                    <p>Heart Attack: {(selectedPatient.prediction.all_class_probabilities["Heart Attack"] * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}
            </div>
            <button 
              className="modal-close"
              onClick={() => setShowPatientModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 