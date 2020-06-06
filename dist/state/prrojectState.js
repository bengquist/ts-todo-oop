import { ProjectStatus } from "../models/project.js";
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(fn) {
        this.listeners.push(fn);
    }
}
export class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, people) {
        const newProject = {
            id: Math.random().toString(),
            title,
            description,
            people,
            status: ProjectStatus.Active,
        };
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((project) => project.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const fn of this.listeners) {
            fn(this.projects.slice());
        }
    }
}
export const projectState = ProjectState.getInstance();
