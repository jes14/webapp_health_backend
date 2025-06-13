"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToFHIR = void 0;
const axios_1 = __importDefault(require("axios"));
const FHIR_SERVER = 'http://localhost:8080/fhir'; // HAPI FHIR 서버 주소
const sendToFHIR = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const birthYear = new Date().getFullYear() - data.age;
    const patient = {
        resourceType: 'Patient',
        name: [{ text: data.name }],
        gender: data.gender,
        birthDate: `${birthYear}-01-01`
    };
    const patientRes = yield axios_1.default.post(`${FHIR_SERVER}/Patient`, patient);
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
    yield axios_1.default.post(`${FHIR_SERVER}/Condition`, condition);
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
    yield axios_1.default.post(`${FHIR_SERVER}/Observation`, observation);
});
exports.sendToFHIR = sendToFHIR;
