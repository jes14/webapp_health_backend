import axios from 'axios';

const FHIR_SERVER = 'http://localhost:8080/fhir'; // HAPI FHIR 서버 주소

export const sendToFHIR = async (data: any) => {
  const birthYear = new Date().getFullYear() - data.age;

  const patient = {
    resourceType: 'Patient',
    name: [{ text: data.name }],
    gender: data.gender,
    birthDate: `${birthYear}-01-01`
  };

  const patientRes = await axios.post(`${FHIR_SERVER}/Patient`, patient);
  const patientId = patientRes.data.id;

  const condition = {
    resourceType: 'Condition',
    subject: { reference: `Patient/${patientId}` },
    code: {
      coding: [
        {
          system: 'http://hl7.org/fhir/sid/icd-10',
          code: 'B50',
          display: 'Plasmodium falciparum malaria'
        }
      ]
    },
    clinicalStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }]
    },
    recordedDate: new Date().toISOString()
  };

  await axios.post(`${FHIR_SERVER}/Condition`, condition);

  const observation = {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'laboratory'
          }
        ]
      }
    ],
    code: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '12345-6',
          display: 'Malaria Test Result'
        }
      ]
    },
    subject: { reference: `Patient/${patientId}` },
    effectiveDateTime: new Date().toISOString(),
    valueCodeableConcept: {
      coding: [
        {
          code: data.testResult,
          display: data.testResult === 'positive' ? 'Positive' : 'Negative'
        }
      ]
    }
  };

  await axios.post(`${FHIR_SERVER}/Observation`, observation);
};
