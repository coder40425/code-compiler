import Version from "../models/Version";
import Project from "../models/Project";

export const createVersion = async (projectId: string) => {
  const project = await Project.findById(projectId);

  if (!project) {
    throw new Error("Project not found");
  }

  const latestVersion = await Version.findOne({ projectId }).sort({
    versionNumber: -1,
  });

  const nextVersionNumber = latestVersion
    ? latestVersion.versionNumber + 1
    : 1;

  const version = await Version.create({
    projectId,
    code: project.currentCode,
    versionNumber: nextVersionNumber,
  });

  return version;
};

export const getVersionsByProject = async (projectId: string) => {
  return await Version.find({ projectId }).sort({
    versionNumber: -1,
  });
};

export const getVersionById = async (id: string) => {
  return await Version.findById(id);
};

export const restoreVersion = async (
  projectId: string,
  versionId: string
) => {
  const version = await Version.findById(versionId);

  if (!version) {
    throw new Error("Version not found");
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    {
      currentCode: version.code,
    },
    {
      new: true,
    }
  );

  return project;
};