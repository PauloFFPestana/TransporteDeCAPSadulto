import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertTherapistSchema, 
  insertAppointmentSchema 
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

  // APPOINTMENTS API
  // Get all appointments for a specific date
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      let date = req.query.date as string;
      
      // If no date is provided, use today
      if (!date) {
        date = new Date().toISOString().split('T')[0];
      }
      
      const appointments = await storage.getAppointmentsForDate(date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamentos" });
    }
  });

  // Get appointment by id
  app.get("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamento" });
    }
  });

  // Create new appointment
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const newAppointment = await storage.createAppointment(appointmentData);
      res.status(201).json(newAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar agendamento" });
    }
  });

  // Update appointment
  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      
      if (!updatedAppointment) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.json(updatedAppointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar agendamento" });
    }
  });

  // Delete appointment
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAppointment(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao excluir agendamento" });
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
