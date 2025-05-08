import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertTherapistSchema,
  insertActivitySchema,
  insertPatientActivitySchema,
  insertPatientAbsenceSchema,
  insertTherapistAbsenceSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // PATIENTS API
  // Get all patients
  app.get("/api/patients", async (req: Request, res: Response) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pacientes" });
    }
  });

  // Get patient by id
  app.get("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatient(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Paciente não encontrado" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar paciente" });
    }
  });

  // Create new patient
  app.post("/api/patients", async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const newPatient = await storage.createPatient(patientData);
      res.status(201).json(newPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar paciente" });
    }
  });

  // Update patient
  app.patch("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientData = insertPatientSchema.partial().parse(req.body);
      
      const updatedPatient = await storage.updatePatient(id, patientData);
      
      if (!updatedPatient) {
        return res.status(404).json({ message: "Paciente não encontrado" });
      }
      
      res.json(updatedPatient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar paciente" });
    }
  });

  // Get patient activities
  app.get("/api/patients/:id/activities", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientActivities = await storage.getPatientActivitiesByPatientId(id);
      res.json(patientActivities);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar atividades do paciente" });
    }
  });

  // THERAPISTS API
  // Get all therapists
  app.get("/api/therapists", async (req: Request, res: Response) => {
    try {
      const therapists = await storage.getTherapists();
      res.json(therapists);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar terapeutas" });
    }
  });

  // Get therapist by id
  app.get("/api/therapists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const therapist = await storage.getTherapist(id);
      
      if (!therapist) {
        return res.status(404).json({ message: "Terapeuta não encontrado" });
      }
      
      res.json(therapist);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar terapeuta" });
    }
  });

  // Create new therapist
  app.post("/api/therapists", async (req: Request, res: Response) => {
    try {
      const therapistData = insertTherapistSchema.parse(req.body);
      const newTherapist = await storage.createTherapist(therapistData);
      res.status(201).json(newTherapist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar terapeuta" });
    }
  });

  // Update therapist
  app.patch("/api/therapists/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const therapistData = insertTherapistSchema.partial().parse(req.body);
      
      const updatedTherapist = await storage.updateTherapist(id, therapistData);
      
      if (!updatedTherapist) {
        return res.status(404).json({ message: "Terapeuta não encontrado" });
      }
      
      res.json(updatedTherapist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar terapeuta" });
    }
  });

  // ACTIVITIES API
  // Get all activities
  app.get("/api/activities", async (req: Request, res: Response) => {
    try {
      const dayOfWeek = req.query.dayOfWeek as string;
      
      if (dayOfWeek) {
        const activities = await storage.getActivitiesByDayOfWeek(dayOfWeek);
        return res.json(activities);
      }
      
      const activities = await storage.getActivitiesWithNames();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar atividades" });
    }
  });

  // Get activity by id
  app.get("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar atividade" });
    }
  });

  // Create new activity
  app.post("/api/activities", async (req: Request, res: Response) => {
    try {
      const activityData = insertActivitySchema.parse(req.body);
      const newActivity = await storage.createActivity(activityData);
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar atividade" });
    }
  });

  // Update activity
  app.patch("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activityData = insertActivitySchema.partial().parse(req.body);
      
      const updatedActivity = await storage.updateActivity(id, activityData);
      
      if (!updatedActivity) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar atividade" });
    }
  });

  // Delete activity
  app.delete("/api/activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Atividade não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir atividade" });
    }
  });
  
  // Get patients by activity
  app.get("/api/activities/:id/patients", async (req: Request, res: Response) => {
    try {
      const activityId = parseInt(req.params.id);
      const patients = await storage.getPatientsByActivityId(activityId);
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar pacientes da atividade", error: String(error) });
    }
  });

  // PATIENT ACTIVITIES API
  // Get all patient activities
  app.get("/api/patient-activities", async (req: Request, res: Response) => {
    try {
      const patientActivities = await storage.getPatientActivitiesWithDetails();
      res.json(patientActivities);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar atividades dos pacientes" });
    }
  });

  // Get patient activity by id
  app.get("/api/patient-activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientActivity = await storage.getPatientActivity(id);
      
      if (!patientActivity) {
        return res.status(404).json({ message: "Atividade do paciente não encontrada" });
      }
      
      res.json(patientActivity);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar atividade do paciente" });
    }
  });

  // Create new patient activity
  app.post("/api/patient-activities", async (req: Request, res: Response) => {
    try {
      const patientActivityData = insertPatientActivitySchema.parse(req.body);
      const newPatientActivity = await storage.createPatientActivity(patientActivityData);
      res.status(201).json(newPatientActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar atividade do paciente" });
    }
  });

  // Update patient activity
  app.patch("/api/patient-activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const patientActivityData = insertPatientActivitySchema.partial().parse(req.body);
      
      const updatedPatientActivity = await storage.updatePatientActivity(id, patientActivityData);
      
      if (!updatedPatientActivity) {
        return res.status(404).json({ message: "Atividade do paciente não encontrada" });
      }
      
      res.json(updatedPatientActivity);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar atividade do paciente" });
    }
  });

  // Delete patient activity
  app.delete("/api/patient-activities/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatientActivity(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Atividade do paciente não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir atividade do paciente" });
    }
  });

  // ABSENCES API
  // Patient absences
  app.get("/api/patient-absences", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const patientId = req.query.patientId ? parseInt(req.query.patientId as string) : undefined;
      
      if (date) {
        const absences = await storage.getPatientAbsencesByDate(date);
        return res.json(absences);
      }
      
      if (patientId) {
        const absences = await storage.getPatientAbsencesByPatientId(patientId);
        return res.json(absences);
      }
      
      const absences = await storage.getPatientAbsences();
      res.json(absences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ausências de pacientes" });
    }
  });

  // Create patient absence
  app.post("/api/patient-absences", async (req: Request, res: Response) => {
    try {
      const absenceData = insertPatientAbsenceSchema.parse(req.body);
      const newAbsence = await storage.createPatientAbsence(absenceData);
      res.status(201).json(newAbsence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar ausência de paciente" });
    }
  });

  // Delete patient absence
  app.delete("/api/patient-absences/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatientAbsence(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ausência de paciente não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir ausência de paciente" });
    }
  });

  // Therapist absences
  app.get("/api/therapist-absences", async (req: Request, res: Response) => {
    try {
      const date = req.query.date as string;
      const therapistId = req.query.therapistId ? parseInt(req.query.therapistId as string) : undefined;
      
      if (date) {
        const absences = await storage.getTherapistAbsencesByDate(date);
        return res.json(absences);
      }
      
      if (therapistId) {
        const absences = await storage.getTherapistAbsencesByTherapistId(therapistId);
        return res.json(absences);
      }
      
      const absences = await storage.getTherapistAbsences();
      res.json(absences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar ausências de terapeutas" });
    }
  });

  // Create therapist absence
  app.post("/api/therapist-absences", async (req: Request, res: Response) => {
    try {
      const absenceData = insertTherapistAbsenceSchema.parse(req.body);
      const newAbsence = await storage.createTherapistAbsence(absenceData);
      res.status(201).json(newAbsence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao registrar ausência de terapeuta" });
    }
  });

  // Delete therapist absence
  app.delete("/api/therapist-absences/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTherapistAbsence(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Ausência de terapeuta não encontrada" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir ausência de terapeuta" });
    }
  });

  // TRANSPORT LIST API
  // Get transport list for a specific date
  app.get("/api/transport", async (req: Request, res: Response) => {
    try {
      let date = req.query.date as string;
      
      // If no date is provided, use today
      if (!date) {
        date = new Date().toISOString().split('T')[0];
      }
      
      const transportList = await storage.getTransportListForDate(date);
      res.json(transportList);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar lista de transporte" });
    }
  });

  // Get weekly transport schedule
  app.get("/api/transport/weekly", async (req: Request, res: Response) => {
    try {
      let startDate = req.query.startDate as string;
      
      // If no start date is provided, use Monday of current week
      if (!startDate) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days, otherwise go back to Monday
        today.setDate(today.getDate() - daysToSubtract);
        startDate = today.toISOString().split('T')[0];
      }
      
      const weeklySchedule = await storage.getWeeklyTransportSchedule(startDate);
      res.json(weeklySchedule);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar programação semanal de transporte" });
    }
  });

  // STATS API
  // Get transport stats for a specific date
  app.get("/api/stats/transport", async (req: Request, res: Response) => {
    try {
      let date = req.query.date as string;
      
      // If no date is provided, use today
      if (!date) {
        date = new Date().toISOString().split('T')[0];
      }
      
      const stats = await storage.getTransportStats(date);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar estatísticas" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
