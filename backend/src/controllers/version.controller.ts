import { Request, Response } from "express";
import * as versionService from "../services/version.service";

export const createVersion = async (req: Request, res: Response) => {
  try {
    const version = await versionService.createVersion(
      req.params.projectId as string
    );

    res.status(201).json(version);
  } catch (error: any) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getVersionsByProject = async (
  req: Request,
  res: Response
) => {
  try {
    const versions = await versionService.getVersionsByProject(
      req.params.projectId as string
    );
    res.status(200).json(versions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getVersionById = async (req: Request, res: Response) => {
  try {
    const version = await versionService.getVersionById(
      req.params.versionId as string
    );

    if (!version) {
      return res.status(404).json({ message: "Version not found" });
    }

    res.status(200).json(version);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const restoreVersion = async (
  req: Request,
  res: Response
) => {
  try {
    const project = await versionService.restoreVersion(
      req.params.projectId as string,
      req.params.versionId as string
    );

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