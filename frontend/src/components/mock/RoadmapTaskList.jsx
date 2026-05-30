import React from "react";

const STATUS_LABELS = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const RoadmapTaskList = ({ roadmap, onStatusChange, isUpdating }) => {
  return (
    <div className="neo-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-lg font-bold">{roadmap.skill}</h3>
          <p className="text-xs text-[color:var(--neo-muted)]">Severity: {roadmap.severity}</p>
        </div>
        <div className="neo-inset px-3 py-1 rounded-full text-xs font-bold text-[color:var(--neo-accent)]">
          {roadmap.progressPercent || 0}%
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {roadmap.tasks?.map((task) => (
          <div key={task._id || task.id} className="neo-inset p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{task.title}</p>
                <p className="text-xs text-[color:var(--neo-muted)]">
                  {task.resourceType} {task.estimatedMinutes ? `• ${task.estimatedMinutes} min` : ""}
                </p>
              </div>
              <select
                className="neo-input text-xs px-3 py-2"
                value={task.status}
                disabled={isUpdating}
                onChange={(event) => onStatusChange(task, event.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            {task.resourceUrl && (
              <a
                href={task.resourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-[color:var(--neo-accent)]"
              >
                View resource
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoadmapTaskList;
