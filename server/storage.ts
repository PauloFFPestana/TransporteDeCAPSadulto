import { 
  patients, Patient, InsertPatient,
  therapists, Therapist, InsertTherapist,
  appointments, Appointment, InsertAppointment,
  AppointmentWithNames
} from "@shared/schema";

export interface IStorage {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  
  // Therapists
  getTherapists(): Promise<Therapist[]>;
  getTherapist(id: number): Promise<Therapist | undefined>;
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  updateTherapist(id: number, therapist: Partial<InsertTherapist>): Promise<Therapist | undefined>;
  
  // Appointments
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsForDate(date: string): Promise<AppointmentWithNames[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Stats
  getTransportStats(date: string): Promise<{
    total: number;
    confirmed: number;
    absent: number;
  }>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient>;
  private therapists: Map<number, Therapist>;
  private appointments: Map<number, Appointment>;
  
  private patientIdCounter: number;
  private therapistIdCounter: number;
  private appointmentIdCounter: number;

  constructor() {
    this.patients = new Map();
    this.therapists = new Map();
    this.appointments = new Map();
    
    this.patientIdCounter = 1;
    this.therapistIdCounter = 1;
    this.appointmentIdCounter = 1;
    
    // Add some initial data
    this.initializeData();
  }
  
  private initializeData() {
    // Add some patients
    const patient1 = {
      id: this.patientIdCounter++,
      name: "Maria Silva",
      phone: "(11) 98765-4321",
      address: "Rua das Flores, 123",
      active: true
    };
    
    const patient2 = {
      id: this.patientIdCounter++,
      name: "João Santos",
      phone: "(11) 91234-5678",
      address: "Av. Central, 456",
      active: true
    };
    
    const patient3 = {
      id: this.patientIdCounter++,
      name: "Pedro Almeida",
      phone: "(11) 99876-5432",
      address: "Rua do Pinheiro, 789",
      active: true
    };
    
    this.patients.set(patient1.id, patient1);
    this.patients.set(patient2.id, patient2);
    this.patients.set(patient3.id, patient3);
    
    // Add some therapists
    const therapist1 = {
      id: this.therapistIdCounter++,
      name: "Dr. Carlos Oliveira",
      specialty: "Fisioterapia",
      email: "carlos.oliveira@exemplo.com",
      phone: "(11) 97777-8888",
      workDays: "Seg,Qua,Sex",
      active: true
    };
    
    const therapist2 = {
      id: this.therapistIdCounter++,
      name: "Dra. Ana Pereira",
      specialty: "Terapia Ocupacional",
      email: "ana.pereira@exemplo.com",
      phone: "(11) 96666-7777",
      workDays: "Ter,Qui",
      active: true
    };
    
    const therapist3 = {
      id: this.therapistIdCounter++,
      name: "Dr. Bruno Costa",
      specialty: "Fonoaudiologia",
      email: "bruno.costa@exemplo.com",
      phone: "(11) 95555-6666",
      workDays: "Seg,Ter,Qua,Qui,Sex",
      active: true
    };
    
    this.therapists.set(therapist1.id, therapist1);
    this.therapists.set(therapist2.id, therapist2);
    this.therapists.set(therapist3.id, therapist3);
    
    // Create a few appointments for today
    const today = new Date().toISOString().split('T')[0];
    
    const appointment1 = {
      id: this.appointmentIdCounter++,
      patientId: patient1.id,
      therapistId: therapist1.id,
      date: today,
      startTime: "09:30:00",
      endTime: "10:30:00",
      notes: "",
      transportNeeded: true,
      status: "confirmed"
    };
    
    const appointment2 = {
      id: this.appointmentIdCounter++,
      patientId: patient2.id,
      therapistId: therapist2.id,
      date: today,
      startTime: "10:00:00",
      endTime: "11:00:00",
      notes: "",
      transportNeeded: true,
      status: "absent_patient"
    };
    
    const appointment3 = {
      id: this.appointmentIdCounter++,
      patientId: patient3.id,
      therapistId: therapist3.id,
      date: today,
      startTime: "11:30:00",
      endTime: "12:30:00",
      notes: "",
      transportNeeded: true,
      status: "absent_therapist"
    };
    
    this.appointments.set(appointment1.id, appointment1);
    this.appointments.set(appointment2.id, appointment2);
    this.appointments.set(appointment3.id, appointment3);
  }

  // Patient methods
  async getPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const id = this.patientIdCounter++;
    const newPatient = { ...patient, id };
    this.patients.set(id, newPatient);
    return newPatient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) {
      return undefined;
    }
    
    const updatedPatient = { ...patient, ...patientUpdate };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  // Therapist methods
  async getTherapists(): Promise<Therapist[]> {
    return Array.from(this.therapists.values());
  }

  async getTherapist(id: number): Promise<Therapist | undefined> {
    return this.therapists.get(id);
  }

  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    const id = this.therapistIdCounter++;
    const newTherapist = { ...therapist, id };
    this.therapists.set(id, newTherapist);
    return newTherapist;
  }

  async updateTherapist(id: number, therapistUpdate: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const therapist = this.therapists.get(id);
    if (!therapist) {
      return undefined;
    }
    
    const updatedTherapist = { ...therapist, ...therapistUpdate };
    this.therapists.set(id, updatedTherapist);
    return updatedTherapist;
  }

  // Appointment methods
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointmentsForDate(date: string): Promise<AppointmentWithNames[]> {
    const appointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.date === date);
    
    return appointments.map(appointment => {
      const patient = this.patients.get(appointment.patientId);
      const therapist = this.therapists.get(appointment.therapistId);
      
      return {
        ...appointment,
        patientName: patient?.name || 'Paciente desconhecido',
        therapistName: therapist?.name || 'Terapeuta desconhecido',
        therapistSpecialty: therapist?.specialty || 'Especialidade desconhecida'
      };
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const newAppointment = { ...appointment, id };
    this.appointments.set(id, newAppointment);
    return newAppointment;
  }

  async updateAppointment(id: number, appointmentUpdate: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment = { ...appointment, ...appointmentUpdate };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }

  // Stats methods
  async getTransportStats(date: string): Promise<{ total: number; confirmed: number; absent: number; }> {
    const appointments = Array.from(this.appointments.values())
      .filter(appointment => appointment.date === date && appointment.transportNeeded);
    
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === "confirmed").length;
    const absent = appointments.filter(a => a.status === "absent_patient" || a.status === "absent_therapist" || a.status === "cancelled").length;
    
    return { total, confirmed, absent };
  }
}

export const storage = new MemStorage();
