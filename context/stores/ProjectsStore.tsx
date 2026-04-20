import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../AuthContext';
import { Project } from '../../types';
import { ProjectSchema, parseDocs } from '../../schemas';

interface ProjectsStoreValue {
  projects: Project[];
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => Promise<string>;
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const ProjectsStoreContext = createContext<ProjectsStoreValue | undefined>(undefined);

export const ProjectsStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }
    const projectsRef = collection(db, 'users', user.uid, 'projects');
    const unsub = onSnapshot(query(projectsRef), (snapshot) => {
      const data = parseDocs(ProjectSchema, snapshot.docs, 'Project') as Project[];
      setProjects(data);
    });
    return () => unsub();
  }, [user]);

  const addProject = useCallback(
    async (data: Omit<Project, 'id' | 'createdAt'>): Promise<string> => {
      if (!user) return '';
      const ref = doc(collection(db, 'users', user.uid, 'projects'));
      const createdAt = new Date().toISOString();
      const project: Project = {
        ...data,
        id: ref.id,
        createdAt,
        ...(data.status === 'sent' && !data.sentAt ? { sentAt: createdAt } : {}),
      };
      const clean = JSON.parse(JSON.stringify(project));
      await setDoc(ref, clean);
      return ref.id;
    },
    [user]
  );

  const updateProject = useCallback(
    async (id: string, patch: Partial<Project>): Promise<void> => {
      if (!user) return;
      const existing = projects.find((p) => p.id === id);
      if (!existing) return;
      const merged: Project = { ...existing, ...patch, id: existing.id };
      if (patch.status === 'sent' && !merged.sentAt) {
        merged.sentAt = new Date().toISOString();
      }
      const clean = JSON.parse(JSON.stringify(merged));
      await setDoc(doc(db, 'users', user.uid, 'projects', id), clean);
    },
    [user, projects]
  );

  const deleteProject = useCallback(
    async (id: string): Promise<void> => {
      if (!user) return;
      await deleteDoc(doc(db, 'users', user.uid, 'projects', id));
    },
    [user]
  );

  return (
    <ProjectsStoreContext.Provider
      value={{ projects, addProject, updateProject, deleteProject }}
    >
      {children}
    </ProjectsStoreContext.Provider>
  );
};

export const useProjectsStore = (): ProjectsStoreValue => {
  const ctx = useContext(ProjectsStoreContext);
  if (!ctx) throw new Error('useProjectsStore must be used within ProjectsStoreProvider');
  return ctx;
};
