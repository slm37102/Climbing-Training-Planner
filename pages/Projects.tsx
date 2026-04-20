import React, { useMemo, useState } from 'react';
import {
  BookMarked,
  Plus,
  ChevronDown,
  ChevronRight,
  MapPin,
  Mountain,
  Hash,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import {
  Project,
  ProjectDiscipline,
  ProjectStatus,
} from '../types';
import { Button } from '../components/ui/Button';
import { cn } from '../utils';

const STATUS_ORDER: ProjectStatus[] = ['projecting', 'sent', 'shelved'];

const STATUS_META: Record<ProjectStatus, { label: string; dot: string; pill: string }> = {
  projecting: {
    label: 'Projecting',
    dot: 'bg-amber-500',
    pill: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  sent: {
    label: 'Sent',
    dot: 'bg-emerald-500',
    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  shelved: {
    label: 'Shelved',
    dot: 'bg-stone-500',
    pill: 'bg-stone-600/30 text-stone-400 border-stone-600/40',
  },
};

const DISCIPLINE_LABEL: Record<ProjectDiscipline, string> = {
  boulder: 'Boulder',
  sport: 'Sport',
  trad: 'Trad',
};

interface FormState {
  name: string;
  discipline: ProjectDiscipline;
  status: ProjectStatus;
  grade: string;
  crag: string;
  beta: string;
  attempts: string;
}

const emptyForm: FormState = {
  name: '',
  discipline: 'boulder',
  status: 'projecting',
  grade: '',
  crag: '',
  beta: '',
  attempts: '',
};

const toFormState = (p: Project): FormState => ({
  name: p.name,
  discipline: p.discipline,
  status: p.status,
  grade: p.grade ?? '',
  crag: p.crag ?? '',
  beta: p.beta ?? '',
  attempts: typeof p.attempts === 'number' ? String(p.attempts) : '',
});

const ProjectCard: React.FC<{
  project: Project;
  onEdit: (p: Project) => void;
}> = ({ project, onEdit }) => {
  const { updateProject, deleteProject } = useStore();
  const [showBeta, setShowBeta] = useState(false);

  const handleStatus = (next: ProjectStatus) => {
    if (next === project.status) return;
    updateProject(project.id, { status: next });
  };

  const handleDelete = () => {
    if (window.confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
    }
  };

  const handleBumpAttempts = () => {
    const next = (project.attempts ?? 0) + 1;
    updateProject(project.id, { attempts: next });
  };

  return (
    <div className="bg-stone-800/60 rounded-xl p-4 border border-stone-700/50 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-stone-100 truncate">{project.name}</h3>
            {project.grade && (
              <span className="text-xs font-mono bg-stone-700 text-amber-300 px-1.5 py-0.5 rounded">
                {project.grade}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-stone-400 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Mountain className="w-3 h-3" />
              {DISCIPLINE_LABEL[project.discipline]}
            </span>
            {project.crag && (
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{project.crag}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {project.attempts ?? 0} attempts
            </span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(project)}
            aria-label={`Edit ${project.name}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleDelete}
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </div>

      {/* Status toggle buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleStatus(s)}
            aria-label={`Set status ${STATUS_META[s].label}`}
            aria-pressed={project.status === s}
            className={cn(
              'text-xs px-2.5 py-1 rounded-full border transition-colors',
              project.status === s
                ? STATUS_META[s].pill
                : 'bg-transparent text-stone-500 border-stone-700 hover:text-stone-300 hover:border-stone-600'
            )}
          >
            {STATUS_META[s].label}
          </button>
        ))}
        <button
          type="button"
          onClick={handleBumpAttempts}
          className="text-xs px-2.5 py-1 rounded-full border border-stone-700 text-stone-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors ml-auto"
        >
          +1 attempt
        </button>
      </div>

      {/* Beta expander */}
      {project.beta && project.beta.trim().length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowBeta((v) => !v)}
            className="text-xs text-stone-400 hover:text-amber-400 inline-flex items-center gap-1"
            aria-expanded={showBeta}
          >
            {showBeta ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            {showBeta ? 'Hide beta' : 'View beta'}
          </button>
          {showBeta && (
            <pre className="mt-2 whitespace-pre-wrap text-sm text-stone-300 bg-stone-900/60 border border-stone-700/50 rounded-lg p-3 font-sans">
              {project.beta}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const ProjectForm: React.FC<{
  editProject?: Project;
  onClose: () => void;
}> = ({ editProject, onClose }) => {
  const { addProject, updateProject } = useStore();
  const [form, setForm] = useState<FormState>(
    editProject ? toFormState(editProject) : emptyForm
  );
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const name = form.name.trim();
    if (!name) return;
    setSubmitting(true);
    try {
      const attemptsNum = form.attempts.trim() === '' ? undefined : Math.max(0, Math.floor(Number(form.attempts)));
      const payload = {
        name,
        discipline: form.discipline,
        status: form.status,
        ...(form.grade.trim() ? { grade: form.grade.trim() } : {}),
        ...(form.crag.trim() ? { crag: form.crag.trim() } : {}),
        ...(form.beta.trim() ? { beta: form.beta } : {}),
        ...(attemptsNum !== undefined && !Number.isNaN(attemptsNum) ? { attempts: attemptsNum } : {}),
      };
      if (editProject) {
        await updateProject(editProject.id, payload);
      } else {
        await addProject(payload);
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-stone-900 border border-stone-700 rounded-t-2xl sm:rounded-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-stone-100 text-lg">
            {editProject ? 'Edit Project' : 'New Project'}
          </h2>
          <Button size="icon" variant="ghost" type="button" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <label className="block">
          <span className="text-xs text-stone-400">Name *</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="e.g. Midnight Lightning"
            className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-stone-400">Discipline *</span>
            <select
              value={form.discipline}
              onChange={(e) => set('discipline', e.target.value as ProjectDiscipline)}
              className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="boulder">Boulder</option>
              <option value="sport">Sport</option>
              <option value="trad">Trad</option>
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-stone-400">Status</span>
            <select
              value={form.status}
              onChange={(e) => set('status', e.target.value as ProjectStatus)}
              className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-500"
            >
              <option value="projecting">Projecting</option>
              <option value="sent">Sent</option>
              <option value="shelved">Shelved</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs text-stone-400">Grade</span>
            <input
              type="text"
              value={form.grade}
              onChange={(e) => set('grade', e.target.value)}
              placeholder="V6 / 5.12a"
              className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-xs text-stone-400">Attempts</span>
            <input
              type="number"
              min={0}
              value={form.attempts}
              onChange={(e) => set('attempts', e.target.value)}
              placeholder="0"
              className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-stone-400">Crag</span>
          <input
            type="text"
            value={form.crag}
            onChange={(e) => set('crag', e.target.value)}
            placeholder="e.g. Yosemite, Camp 4"
            className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
          />
        </label>

        <label className="block">
          <span className="text-xs text-stone-400">Beta / Sequence</span>
          <textarea
            value={form.beta}
            onChange={(e) => set('beta', e.target.value)}
            rows={5}
            placeholder="Notes on the sequence, holds, conditions…"
            className="mt-1 w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-y"
          />
        </label>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={submitting || !form.name.trim()}>
            {editProject ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export const Projects: React.FC = () => {
  const { projects } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>(undefined);
  const [openStatus, setOpenStatus] = useState<Record<ProjectStatus, boolean>>({
    projecting: true,
    sent: true,
    shelved: false,
  });

  const grouped = useMemo(() => {
    const out: Record<ProjectStatus, Project[]> = {
      projecting: [],
      sent: [],
      shelved: [],
    };
    for (const p of projects) out[p.status].push(p);
    for (const key of STATUS_ORDER) {
      out[key].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return out;
  }, [projects]);

  const openEdit = (p: Project) => {
    setEditing(p);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(undefined);
  };

  return (
    <div className="pb-24 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-stone-100">Beta Book</h1>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={() => {
            setEditing(undefined);
            setShowForm(true);
          }}
        >
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-stone-800/50 rounded-xl p-8 text-center border border-stone-700/50">
          <BookMarked className="w-10 h-10 text-stone-600 mx-auto mb-3" />
          <p className="text-stone-400 font-medium">No projects yet</p>
          <p className="text-stone-500 text-sm mt-1">
            Track routes you're working on with beta notes and attempt counts.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setEditing(undefined);
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Your First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {STATUS_ORDER.map((status) => {
            const bucket = grouped[status];
            if (bucket.length === 0) return null;
            const isOpen = openStatus[status];
            return (
              <section key={status} className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setOpenStatus((prev) => ({ ...prev, [status]: !prev[status] }))
                  }
                  className="w-full flex items-center gap-2 text-left"
                  aria-expanded={isOpen}
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  )}
                  <span className={cn('w-2 h-2 rounded-full', STATUS_META[status].dot)} />
                  <h2 className="font-semibold text-stone-200">
                    {STATUS_META[status].label}
                  </h2>
                  <span className="text-xs text-stone-500">({bucket.length})</span>
                </button>
                {isOpen && (
                  <div className="space-y-3">
                    {bucket.map((p) => (
                      <ProjectCard key={p.id} project={p} onEdit={openEdit} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {showForm && <ProjectForm editProject={editing} onClose={closeForm} />}
    </div>
  );
};

export default Projects;
