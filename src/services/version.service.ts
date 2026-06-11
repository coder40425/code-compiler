import Version from "../models/Version";

export const createVersion = async (data: any) => {
  return await Version.create(data);
};

export const getVersionsByProject = async (projectId: string) => {
  return await Version.find({ projectId }).sort({
    versionNumber: -1,
  });
};

export const getVersionById = async (id: string) => {
  return await Version.findById(id);
};