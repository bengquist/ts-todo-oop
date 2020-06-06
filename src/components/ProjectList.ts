import bind from "../decorators/bind";
import { DragTarget } from "../models/dnd";
import { Project, ProjectStatus } from "../models/project";
import { projectState } from "../state/prrojectState";
import Component from "./Component";
import ProjectItem from "./ProjectItem";

export default class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
  }

  @bind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer?.types[0] === "text/plain") {
      event.preventDefault();
      const listElement = this.element.querySelector("ul");
      listElement?.classList.add("droppable");
    }
  }

  @bind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData("text/plain");

    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @bind
  dragLeaveHandler() {
    const listElement = this.element.querySelector("ul");
    listElement?.classList.remove("droppable");
  }

  renderContent() {
    const listId = `${this.type}-project-list}`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  configure() {
    projectState.addListener((projects) => {
      const filteredProjects = this.filterProjects(projects);

      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });

    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);
  }

  private filterProjects(projects: Project[]) {
    return projects.filter((project) => {
      if (this.type === "active") {
        return project.status === ProjectStatus.Active;
      } else {
        return project.status === ProjectStatus.Finished;
      }
    });
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-project-list}`
    ) as HTMLUListElement;

    listEl.innerHTML = "";

    for (const project of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, project);
    }
  }
}
