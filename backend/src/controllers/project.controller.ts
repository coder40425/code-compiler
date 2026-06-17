import { Response } from "express";
import * as projectService from "../services/project.service";
import { AuthRequest } from "../middleware/auth.middleware";

export const createProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const project = await projectService.createProject({
      ...req.body,
      userId: req.userId,
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllProjects = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const projects =
      await projectService.getAllProjects(
        req.userId!
      );

    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await projectService.getProjectById(id, req.userId!);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await projectService.updateProject(id, req.userId!, req.body);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const project = await projectService.deleteProject(id, req.userId!);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};