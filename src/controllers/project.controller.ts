import { Request, Response } from "express";
import * as projectService from "../services/project.service";

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllProjects = async (_req: Request, res: Response) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await projectService.getProjectById(
      req.params.id as string
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.updateProject(
      req.params.id as string,
      req.body
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const project = await projectService.deleteProject(
      req.params.id as string
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};