/**
 * Calculates project completion progress based on weighted tasks and subtasks.
 */
export function calculateProjectProgress(project) {
  if (project.manualProgressOverride && typeof project.progress === 'number') {
    return Math.min(100, Math.max(0, project.progress));
  }

  if (!project.tasks || project.tasks.length === 0) {
    if (project.status === 'Completed') return 100;
    if (project.status === 'Maintained') return 100;
    if (project.status === 'Planned') return 0;
    return typeof project.progress === 'number' ? project.progress : 25;
  }

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const task of project.tasks) {
    const w = task.weight || 1;
    totalWeight += w;

    if (task.completed) {
      earnedWeight += w;
    } else if (task.subtasks && task.subtasks.length > 0) {
      const completedSubCount = task.subtasks.filter(st => st.completed).length;
      earnedWeight += w * (completedSubCount / task.subtasks.length);
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}

/**
 * Calculates interactive roadmap progress based on phase/stage steps completion with weight support.
 */
export function calculateRoadmapProgress(phases = []) {
  if (!phases || phases.length === 0) return 0;

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const phase of phases) {
    if (phase.steps && phase.steps.length > 0) {
      for (const step of phase.steps) {
        const weight = Math.max(1, Number(step.weight) || 1);
        totalWeight += weight;
        if (step.completed || step.status === 'completed') {
          earnedWeight += weight;
        }
      }
    }
  }

  return totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
}
