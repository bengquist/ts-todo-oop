import bind from "../decorators/bind.js";
import { Draggable } from "../models/dnd.js";
import { Project } from "../models/project.js";
import Component from "./Component.js";

export default class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable {
  private get people() {
    if (this.project.people === 1) {
      return "1 person assigned";
    } else {
      return `${this.project.people} people assigned`;
    }
  }

  constructor(private hostId: string, private project: Project) {
    super("single-project", hostId, true, project.id);

    this.configure();
    this.renderContent();
  }

  @bind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer?.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler() {
    console.log("drag ended");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.people;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
