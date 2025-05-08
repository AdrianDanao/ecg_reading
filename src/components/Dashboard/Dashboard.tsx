import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithPrediction | null>(null);
  const [patients, setPatients] = useState<PatientWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePredictions, setAvailablePredictions] = useState<Prediction[]>([]);
  const [showCardMenu, setShowCardMenu] = useState<string | null>(null);
  const [showECGModal, setShowECGModal] = useState(false);
  const [selectedECG, setSelectedECG] = useState<Prediction | null>(null);

  const fetchData = async () => {
    try {
      // Fetch patients
      const patientsResponse = await fetch(`${API_BASE_URL}/patients`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!patientsResponse.ok) {
        throw new Error(`HTTP error! status: ${patientsResponse.status}`);
      }

      const patientsData: Patient[] = await patientsResponse.json();

      // Fetch latest prediction
      const predictionResponse = await fetch(`${API_BASE_URL}/predictions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      let latestPrediction: Prediction | null = null;
      if (predictionResponse.ok) {
        latestPrediction = await predictionResponse.json();
      }

      // Calculate BPM from ECG data
      const calculateBPM = (ecgValues: number[]): number => {
        if (!ecgValues || ecgValues.length < 2) return 0;
        
        // Count peaks in the ECG signal
        let peaks = 0;
        for (let i = 1; i < ecgValues.length - 1; i++) {
          if (ecgValues[i] > ecgValues[i-1] && ecgValues[i] > ecgValues[i+1]) {
            peaks++;
          }
        }
        
        // Assuming 1 second of data, calculate BPM
        // Adjust this calculation based on your actual sampling rate
        const samplingRate = 100; // samples per second
        const duration = ecgValues.length / samplingRate; // in seconds
        return Math.round((peaks / duration) * 5);
      };

      // Map patients with prediction data
      const patientsWithPredictions = patientsData.map(patient => {
        const bpm = latestPrediction ? calculateBPM(latestPrediction.value) : 0;
        const status: 'stable' | 'critical' = latestPrediction && 
          (latestPrediction.label === "Heart Attack" || 
           latestPrediction.confidence_percent > 80) ? 'critical' : 'stable';

        return {
          ...patient,
          prediction: latestPrediction || undefined,
          bpm,
          status
        };
      });

      setPatients(patientsWithPredictions);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch available predictions for new patient form
    const fetchPredictions = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/predictions');
        if (!response.ok) {
          throw new Error('Failed to fetch predictions');
        }
        const data = await response.json();
        // Convert single prediction to array if needed
        setAvailablePredictions(data ? [data] : []);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setAvailablePredictions([]);
      }
    };
    fetchPredictions();
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

  const handleNewPatient = async (formData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowNewPatientModal(false);
        fetchData(); // Refresh the patient list
      }
    } catch (error) {
      console.error('Error creating patient:', error);
    }
  };

  const handleDeletePatient = async (patientId: string) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/patients/${patientId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          fetchData(); // Refresh the patient list
        }
      } catch (error) {
        console.error('Error deleting patient:', error);
      }
    }
  };

  const handleECGClick = (prediction: Prediction) => {
    setSelectedECG(prediction);
    setShowECGModal(true);
  };

  if (loading) {
    return <div className="loading">Loading patient data...</div>;
  }

  return (
    <div className="dashboard">
      <nav className="dashboard-nav">
        <div className="nav-brand">HeartGuard.UI</div>
        <div className="nav-actions">
          <button 
            className="new-patient-button"
            onClick={() => setShowNewPatientModal(true)}
          >
            Add New Patient
          </button>
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
        </div>
      </nav>

      <main className="dashboard-content">
        <div className="patient-grid">
          {patients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-header">
                <h3>{patient.name}</h3>
                <div className="patient-actions-header">
                  <span className={`status-badge ${patient.status}`}>
                    {patient.status}
                  </span>
                  <div className="card-menu">
                    <button 
                      className="menu-button"
                      onClick={() => setShowCardMenu(showCardMenu === patient._id ? null : patient._id)}
                    >
                      ☰
                    </button>
                    {showCardMenu === patient._id && (
                      <div className="card-menu-dropdown">
                        <button onClick={() => handlePatientInfo(patient)}>Edit</button>
                        <button onClick={() => handleDeletePatient(patient._id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="ecg-container" onClick={() => patient.prediction && handleECGClick(patient.prediction)}>
                {patient.prediction && (
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={patient.prediction.value.map((val, index) => ({
                      index,
                      voltage: val
                    }))}>
                      <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                      <XAxis dataKey="index" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="voltage" 
                        stroke={patient.status === 'critical' ? '#EF4444' : '#4ADE80'} 
                        dot={false}
                        strokeWidth={1.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
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

      {showNewPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add New Patient</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleNewPatient(Object.fromEntries(formData));
            }}>
              <div className="form-group">
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age:</label>
                <input type="number" id="age" name="age" required />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender:</label>
                <select id="gender" name="gender" required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="bloodType">Blood Type:</label>
                <select id="bloodType" name="bloodType" required>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="address">Address:</label>
                <input type="text" id="address" name="address" required />
              </div>
              <div className="form-group">
                <label htmlFor="contactNumber">Contact Number:</label>
                <input type="tel" id="contactNumber" name="contactNumber" required />
              </div>
              <div className="form-group">
                <label htmlFor="emergencyContact">Emergency Contact:</label>
                <input type="tel" id="emergencyContact" name="emergencyContact" required />
              </div>
              <div className="form-group">
                <label htmlFor="prediction">Select ECG Prediction:</label>
                <select id="prediction" name="prediction" required>
                  {availablePredictions && availablePredictions.length > 0 ? (
                    availablePredictions.map(pred => (
                      <option key={pred._id} value={pred._id}>
                        {pred.label} ({pred.confidence_percent.toFixed(1)}% confidence)
                      </option>
                    ))
                  ) : (
                    <option value="">No predictions available</option>
                  )}
                </select>
              </div>
              <div className="form-actions">
                <button type="submit" className="submit-button">Add Patient</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowNewPatientModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <p>Normal: {(selectedPatient.prediction.all_class_probabilities.Normal).toFixed(1)}%</p>
                    <p>Heart Attack: {(selectedPatient.prediction.all_class_probabilities["Heart Attack"]).toFixed(1)}%</p>
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

      {/* 12-Lead ECG Modal */}
      {showECGModal && selectedECG && (
        <div className="modal-overlay">
          <div className="ecg-modal modal-content-lead">
            <h2>12-Lead ECG Analysis</h2>
            <div className="ecg-grid">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="ecg-lead">
                  <h4>Lead {i + 1}</h4>
                  <ResponsiveContainer width="100%" height={100}>
                    <LineChart data={selectedECG.value.map((val, index) => ({
                      index,
                      voltage: val
                    }))}>
                      <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                      <XAxis dataKey="index" hide={true} />
                      <YAxis hide={true} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="voltage" 
                        stroke={selectedECG.label === "Heart Attack" ? '#EF4444' : '#4ADE80'} 
                        dot={false}
                        strokeWidth={1.5}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
            <div className="ecg-analysis">
              <h3>AI Analysis</h3>
              <p>Diagnosis: {selectedECG.label}</p>
              <p>Confidence: {selectedECG.confidence_percent.toFixed(1)}%</p>
              <div className="probability-breakdown">
                <p>Normal: {(selectedECG.all_class_probabilities.Normal).toFixed(1)}%</p>
                <p>Heart Attack: {(selectedECG.all_class_probabilities["Heart Attack"]).toFixed(1)}%</p>
              </div>
            </div>
            <button 
              className="modal-close"
              onClick={() => setShowECGModal(false)}
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