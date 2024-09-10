import React, { useState } from 'react';
import './Segment.css';
const schemaOptions = [
  { label: 'First Name', value: 'first_name' },
  { label: 'Last Name', value: 'last_name' },
  { label: 'Gender', value: 'gender' },
  { label: 'Age', value: 'age' },
  { label: 'Account Name', value: 'account_name' },
  { label: 'City', value: 'city' },
  { label: 'State', value: 'state' },
];

const WEBHOOK_URL = 'https://webhook.site/d2ace6fc-7199-4116-aad4-bf6ecb0f32e7';

const SegmentCreator = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [segmentName, setSegmentName] = useState('');
  const [selectedSchemas, setSelectedSchemas] = useState([]);
  const [currentSchema, setCurrentSchema] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSaveSegment = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSegmentName('');
    setSelectedSchemas([]);
    setCurrentSchema('');
    setSaveError('');
  };

  const handleAddSchema = () => {
    if (currentSchema) {
      setSelectedSchemas([...selectedSchemas, currentSchema]);
      setCurrentSchema('');
    }
  };

  const handleRemoveSchema = (index) => {
    const newSchemas = [...selectedSchemas];
    newSchemas.splice(index, 1);
    setSelectedSchemas(newSchemas);
  };

  const handleSaveToServer = async () => {
    setIsSaving(true);
    setSaveError('');
  
    const data = {
      segment_name: segmentName,
      schema: selectedSchemas.map(schema => ({ [schema]: schemaOptions.find(opt => opt.value === schema).label }))
    };
  
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (response.ok) {
        console.log('Data sent successfully to webhook');
        handleClosePopup();
      } else {
        let errorMessage = 'Failed to save segment. ';
        switch (response.status) {
          case 403:
            errorMessage += 'Access forbidden. Please check your authentication.';
            break;
          case 404:
            errorMessage += 'Endpoint not found. Please verify the webhook URL.';
            break;
          default:
            errorMessage += `Server responded with status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error sending data to webhook:', error);
      setSaveError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableOptions = schemaOptions.filter(option => !selectedSchemas.includes(option.value));

  return (
    <div className="container mt-5">
      <button className="btn btn-primary" onClick={handleSaveSegment}>Save segment</button>

      {isPopupOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Saving Segment</h2>
              <button type="button" className="close" onClick={handleClosePopup}>
                <span>&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control mb-3"
                placeholder="Enter the Name of the Segment"
                id="name-of-the-segment"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
              <p>To save your segment, you need to add the schemas to build the query</p>
              <div className="schema-box mb-3">
                {selectedSchemas.map((schema, index) => (
                  <div key={index} className="mb-2 d-flex align-items-center">
                    <select
                      className="form-control mr-2"
                      value={schema}
                      onChange={(e) => {
                        const newSchemas = [...selectedSchemas];
                        newSchemas[index] = e.target.value;
                        setSelectedSchemas(newSchemas);
                      }}
                    >
                      {schemaOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button className="btn btn-outline-danger" onClick={() => handleRemoveSchema(index)}>
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <select
                className="form-control mb-2"
                value={currentSchema}
                onChange={(e) => setCurrentSchema(e.target.value)}
              >
                <option value="">Add schema to segment</option>
                {availableOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button className="btn btn-link mb-3" onClick={handleAddSchema}>+ Add new schema</button>
              {saveError && <p className="text-danger mb-2">{saveError}</p>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary mr-2" onClick={handleClosePopup} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSaveToServer} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save the Segment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SegmentCreator;