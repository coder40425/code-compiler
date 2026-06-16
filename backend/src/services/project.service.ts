import Project from "../models/Project";

export const createProject = async (
  data: any
) => {
  return await Project.create(data);
};

export const getAllProjects = async (
  userId: string
) => {
  return await Project.find({
    userId,
  }).sort({
    updatedAt: -1,
  });
};

export const getProjectById = async (
  id: string,
  userId: string
) => {
  return await Project.findOne({
    _id: id,
    userId,
  });
};

export const updateProject = async (
  id: string,
  userId: string,
  data: any
) => {
  return await Project.findOneAndUpdate(
    {
      _id: id,
      userId,
    },
    data,
    {
      new: true,
    }
  );
};

export const deleteProject = async (
  id: string,
  userId: string
) => {
  return await Project.findOneAndDelete({
    _id: id,
    userId,
  });
};