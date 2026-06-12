import Project from "../models/Project";

export const createProject = async (data: any) => {
  return await Project.create(data);
};

export const getAllProjects = async () => {
  return await Project.find();
};

export const getProjectById = async (id: string) => {
  return await Project.findById(id);
};

export const updateProject = async (id: string, data: any) => {
  return await Project.findByIdAndUpdate(id, data, {
    new: true,
  });
};

export const deleteProject = async (id: string) => {
  return await Project.findByIdAndDelete(id);
};