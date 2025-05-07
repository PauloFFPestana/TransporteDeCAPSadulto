import { and, eq, sql, or, desc, asc, isNull, not } from 'drizzle-orm';
import { db } from './db';
import { 
  patients, Patient, InsertPatient,
  therapists, Therapist, InsertTherapist,
  activities, Activity, InsertActivity,
  patientActivities, PatientActivity, InsertPatientActivity,
  patientAbsences, PatientAbsence, InsertPatientAbsence,
  therapistAbsences, TherapistAbsence, InsertTherapistAbsence,
  ActivityWithNames, PatientActivityWithDetails, TransportListItem, WeeklySchedule,
  daysOfWeekShort
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
  
  // Activities
  getActivities(): Promise<Activity[]>;
  getActivitiesWithNames(): Promise<ActivityWithNames[]>;
  getActivitiesByDayOfWeek(dayOfWeek: string): Promise<ActivityWithNames[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<InsertActivity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;
  
  // Patient Activities
  getPatientActivities(): Promise<PatientActivity[]>;
  getPatientActivitiesWithDetails(): Promise<PatientActivityWithDetails[]>;
  getPatientActivitiesByPatientId(patientId: number): Promise<PatientActivityWithDetails[]>;
  getPatientActivity(id: number): Promise<PatientActivity | undefined>;
  createPatientActivity(patientActivity: InsertPatientActivity): Promise<PatientActivity>;
  updatePatientActivity(id: number, patientActivity: Partial<InsertPatientActivity>): Promise<PatientActivity | undefined>;
  deletePatientActivity(id: number): Promise<boolean>;
  
  // Patient Absences
  getPatientAbsences(): Promise<PatientAbsence[]>;
  getPatientAbsencesByDate(date: string): Promise<PatientAbsence[]>;
  getPatientAbsencesByPatientId(patientId: number): Promise<PatientAbsence[]>;
  createPatientAbsence(patientAbsence: InsertPatientAbsence): Promise<PatientAbsence>;
  deletePatientAbsence(id: number): Promise<boolean>;
  
  // Therapist Absences
  getTherapistAbsences(): Promise<TherapistAbsence[]>;
  getTherapistAbsencesByDate(date: string): Promise<TherapistAbsence[]>;
  getTherapistAbsencesByTherapistId(therapistId: number): Promise<TherapistAbsence[]>;
  createTherapistAbsence(therapistAbsence: InsertTherapistAbsence): Promise<TherapistAbsence>;
  deleteTherapistAbsence(id: number): Promise<boolean>;
  
  // Transport List
  getTransportListForDate(date: string): Promise<TransportListItem[]>;
  getWeeklyTransportSchedule(startDate: string): Promise<WeeklySchedule>;
  
  // Stats
  getTransportStats(date: string): Promise<{
    total: number;
    confirmed: number;
    absent: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).where(eq(patients.active, true));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(patient: InsertPatient): Promise<Patient> {
    const [newPatient] = await db.insert(patients).values(patient).returning();
    return newPatient;
  }

  async updatePatient(id: number, patientUpdate: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updatedPatient] = await db
      .update(patients)
      .set(patientUpdate)
      .where(eq(patients.id, id))
      .returning();
    return updatedPatient;
  }

  // Therapists
  async getTherapists(): Promise<Therapist[]> {
    return await db.select().from(therapists).where(eq(therapists.active, true));
  }

  async getTherapist(id: number): Promise<Therapist | undefined> {
    const [therapist] = await db.select().from(therapists).where(eq(therapists.id, id));
    return therapist;
  }

  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    const [newTherapist] = await db.insert(therapists).values(therapist).returning();
    return newTherapist;
  }

  async updateTherapist(id: number, therapistUpdate: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const [updatedTherapist] = await db
      .update(therapists)
      .set(therapistUpdate)
      .where(eq(therapists.id, id))
      .returning();
    return updatedTherapist;
  }

  // Activities
  async getActivities(): Promise<Activity[]> {
    return await db.select().from(activities).where(eq(activities.active, true));
  }

  async getActivitiesWithNames(): Promise<ActivityWithNames[]> {
    const result = await db.query.activities.findMany({
      with: {
        therapist: true
      },
      where: eq(activities.active, true)
    });

    return result.map(item => ({
      ...item,
      therapistName: item.therapist.name,
      therapistSpecialty: item.therapist.specialty
    }));
  }

  async getActivitiesByDayOfWeek(dayOfWeek: string): Promise<ActivityWithNames[]> {
    const result = await db.query.activities.findMany({
      with: {
        therapist: true
      },
      where: and(
        eq(activities.active, true),
        eq(activities.dayOfWeek, dayOfWeek)
      )
    });

    return result.map(item => ({
      ...item,
      therapistName: item.therapist.name,
      therapistSpecialty: item.therapist.specialty
    }));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  async updateActivity(id: number, activityUpdate: Partial<InsertActivity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set(activityUpdate)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const [deleted] = await db
      .update(activities)
      .set({ active: false })
      .where(eq(activities.id, id))
      .returning();
    return !!deleted;
  }

  // Patient Activities
  async getPatientActivities(): Promise<PatientActivity[]> {
    return await db.select().from(patientActivities).where(eq(patientActivities.active, true));
  }

  async getPatientActivitiesWithDetails(): Promise<PatientActivityWithDetails[]> {
    const result = await db.query.patientActivities.findMany({
      with: {
        patient: true,
        activity: {
          with: {
            therapist: true
          }
        }
      },
      where: eq(patientActivities.active, true)
    });

    return result.map(item => ({
      ...item,
      patientName: item.patient.name,
      activityName: item.activity.name,
      dayOfWeek: item.activity.dayOfWeek,
      startTime: item.activity.startTime,
      endTime: item.activity.endTime,
      therapistName: item.activity.therapist.name,
      therapistSpecialty: item.activity.therapist.specialty
    }));
  }

  async getPatientActivitiesByPatientId(patientId: number): Promise<PatientActivityWithDetails[]> {
    const result = await db.query.patientActivities.findMany({
      with: {
        patient: true,
        activity: {
          with: {
            therapist: true
          }
        }
      },
      where: and(
        eq(patientActivities.active, true),
        eq(patientActivities.patientId, patientId)
      )
    });

    return result.map(item => ({
      ...item,
      patientName: item.patient.name,
      activityName: item.activity.name,
      dayOfWeek: item.activity.dayOfWeek,
      startTime: item.activity.startTime,
      endTime: item.activity.endTime,
      therapistName: item.activity.therapist.name,
      therapistSpecialty: item.activity.therapist.specialty
    }));
  }

  async getPatientActivity(id: number): Promise<PatientActivity | undefined> {
    const [patientActivity] = await db.select().from(patientActivities).where(eq(patientActivities.id, id));
    return patientActivity;
  }

  async createPatientActivity(patientActivity: InsertPatientActivity): Promise<PatientActivity> {
    const [newPatientActivity] = await db.insert(patientActivities).values(patientActivity).returning();
    return newPatientActivity;
  }

  async updatePatientActivity(id: number, patientActivityUpdate: Partial<InsertPatientActivity>): Promise<PatientActivity | undefined> {
    const [updatedPatientActivity] = await db
      .update(patientActivities)
      .set(patientActivityUpdate)
      .where(eq(patientActivities.id, id))
      .returning();
    return updatedPatientActivity;
  }

  async deletePatientActivity(id: number): Promise<boolean> {
    const [deleted] = await db
      .update(patientActivities)
      .set({ active: false })
      .where(eq(patientActivities.id, id))
      .returning();
    return !!deleted;
  }

  // Patient Absences
  async getPatientAbsences(): Promise<PatientAbsence[]> {
    return await db.select().from(patientAbsences);
  }

  async getPatientAbsencesByDate(date: string): Promise<PatientAbsence[]> {
    return await db.select().from(patientAbsences).where(eq(patientAbsences.date, date));
  }

  async getPatientAbsencesByPatientId(patientId: number): Promise<PatientAbsence[]> {
    return await db.select().from(patientAbsences).where(eq(patientAbsences.patientId, patientId));
  }

  async createPatientAbsence(patientAbsence: InsertPatientAbsence): Promise<PatientAbsence> {
    const [newPatientAbsence] = await db.insert(patientAbsences).values(patientAbsence).returning();
    return newPatientAbsence;
  }

  async deletePatientAbsence(id: number): Promise<boolean> {
    const result = await db.delete(patientAbsences).where(eq(patientAbsences.id, id));
    return result.rowCount > 0;
  }

  // Therapist Absences
  async getTherapistAbsences(): Promise<TherapistAbsence[]> {
    return await db.select().from(therapistAbsences);
  }

  async getTherapistAbsencesByDate(date: string): Promise<TherapistAbsence[]> {
    return await db.select().from(therapistAbsences).where(eq(therapistAbsences.date, date));
  }

  async getTherapistAbsencesByTherapistId(therapistId: number): Promise<TherapistAbsence[]> {
    return await db.select().from(therapistAbsences).where(eq(therapistAbsences.therapistId, therapistId));
  }

  async createTherapistAbsence(therapistAbsence: InsertTherapistAbsence): Promise<TherapistAbsence> {
    const [newTherapistAbsence] = await db.insert(therapistAbsences).values(therapistAbsence).returning();
    return newTherapistAbsence;
  }

  async deleteTherapistAbsence(id: number): Promise<boolean> {
    const result = await db.delete(therapistAbsences).where(eq(therapistAbsences.id, id));
    return result.rowCount > 0;
  }

  // Transport List
  async getTransportListForDate(date: string): Promise<TransportListItem[]> {
    // Determine day of week from date
    const jsDate = new Date(date);
    const dayIndex = jsDate.getDay() - 1; // 0 = Monday, 4 = Friday
    
    if (dayIndex < 0 || dayIndex > 4) {
      return []; // Weekend, no activities
    }
    
    const dayOfWeek = daysOfWeekShort[dayIndex];
    
    // Get all patient activities for this day of week
    const patientActivitiesResult = await db.query.patientActivities.findMany({
      with: {
        patient: true,
        activity: {
          with: {
            therapist: true
          }
        }
      },
      where: and(
        eq(patientActivities.active, true),
        eq(patientActivities.transportNeeded, true),
        eq(activities.dayOfWeek, dayOfWeek)
      )
    });
    
    // Get all absences for this date
    const patientAbsencesForDate = await this.getPatientAbsencesByDate(date);
    const therapistAbsencesForDate = await this.getTherapistAbsencesByDate(date);
    
    // Create a set of absent patient IDs
    const absentPatientIds = new Set(patientAbsencesForDate.map(a => a.patientId));
    
    // Create a set of absent therapist IDs
    const absentTherapistIds = new Set(therapistAbsencesForDate.map(a => a.therapistId));
    
    // Group activities by patient
    const patientActivitiesMap = new Map<number, any[]>();
    
    for (const pa of patientActivitiesResult) {
      if (!patientActivitiesMap.has(pa.patientId)) {
        patientActivitiesMap.set(pa.patientId, []);
      }
      
      patientActivitiesMap.get(pa.patientId)?.push({
        activityId: pa.activityId,
        activityName: pa.activity.name,
        therapistId: pa.activity.therapistId,
        therapistName: pa.activity.therapist.name,
        startTime: pa.activity.startTime,
        endTime: pa.activity.endTime
      });
    }
    
    // Convert to transport list items
    const transportList: TransportListItem[] = [];
    
    for (const [patientId, activities] of patientActivitiesMap.entries()) {
      // Check if patient is absent
      const isPatientAbsent = absentPatientIds.has(patientId);
      
      // Check if all therapists for this patient's activities are absent
      const hasNonAbsentTherapist = activities.some(a => !absentTherapistIds.has(a.therapistId));
      
      // Patient is considered absent if:
      // 1. They have a direct absence record, OR
      // 2. All their therapists are absent (implying they don't need to come in)
      const isAbsent = isPatientAbsent || !hasNonAbsentTherapist;
      
      // Get patient details
      const patient = await this.getPatient(patientId);
      
      if (patient) {
        transportList.push({
          patientId,
          patientName: patient.name,
          activities,
          isAbsent
        });
      }
    }
    
    // Sort by patient name
    return transportList.sort((a, b) => a.patientName.localeCompare(b.patientName));
  }

  async getWeeklyTransportSchedule(startDate: string): Promise<WeeklySchedule> {
    // Parse start date and generate dates for the week
    const jsStartDate = new Date(startDate);
    const dates = [];
    
    // Ensure we're starting from Monday
    const dayOfWeek = jsStartDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back to Monday
    jsStartDate.setDate(jsStartDate.getDate() - daysToSubtract);
    
    // Generate the 5 weekdays
    for (let i = 0; i < 5; i++) {
      const date = new Date(jsStartDate);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Get transport lists for each day
    const [monday, tuesday, wednesday, thursday, friday] = await Promise.all([
      this.getTransportListForDate(dates[0]),
      this.getTransportListForDate(dates[1]),
      this.getTransportListForDate(dates[2]),
      this.getTransportListForDate(dates[3]),
      this.getTransportListForDate(dates[4])
    ]);
    
    return {
      monday,
      tuesday,
      wednesday,
      thursday,
      friday
    };
  }

  // Stats methods
  async getTransportStats(date: string): Promise<{ total: number; confirmed: number; absent: number; }> {
    const transportList = await this.getTransportListForDate(date);
    
    const total = transportList.length;
    const absent = transportList.filter(t => t.isAbsent).length;
    const confirmed = total - absent;
    
    return { total, confirmed, absent };
  }
}

export const storage = new DatabaseStorage();
