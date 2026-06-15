import { Request, Response } from "express";
import * as executionHistoryService from "../services/executionHistory.service";

export const getAllExecutions = async (
    req: Request,
    res: Response
) => {
    try {
        const executions =
            await executionHistoryService.getAllExecutions();

        res.status(200).json(executions);
    } catch (error: any) {
        res
            .status(500)
            .json({ message: error.message });
    }
};

export const getExecutionByJobId = async (
    req: Request,
    res: Response
) => {
    try {
        const execution =
            await executionHistoryService.getExecutionByJobId(
                req.params.jobId as string
            );

        if (!execution) {
            return res
                .status(404)
                .json({ message: "Execution not found" });
        }

        res.status(200).json(execution);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getExecutionsByProject = async (
    req: Request,
    res: Response
) => {
    try {
        const executions =
            await executionHistoryService.getExecutionsByProject(
                req.params.projectId as string
            );

        res.status(200).json(executions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getExecutionsByUser = async (
    req: Request,
    res: Response
) => {
    try {
        const executions =
            await executionHistoryService.getExecutionsByUser(
                req.params.userId as string
            );

        res.status(200).json(executions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};