// Drag & Drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project
enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(fn: Listener<T>) {
    this.listeners.push(fn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
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

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);

    if (project) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const fn of this.listeners) {
      fn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//Validation
interface Validate {
  value: string | number;
  required?: boolean;
  min?: number;
  max?: number;
}

function validate({ value, ...options }: Validate) {
  let isValid = true;

  if (options.required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (options.min && typeof value === "number") {
    isValid = isValid && value >= options.min;
  }
  if (options.min && typeof value === "string") {
    isValid = isValid && value.length >= options.min;
  }
  if (options.max && typeof value === "number") {
    isValid = isValid && value <= options.max;
  }
  if (options.max && typeof value === "string") {
    isValid = isValid && value.length <= options.max;
  }

  return isValid;
}

// Decorators
function bind(_: any, __: string, desciptor: PropertyDescriptor) {
  const newMethod: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundMethod = desciptor.value.bind(this);
      return boundMethod;
    },
  };

  return newMethod;
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId) as T;

    const templateContent = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = templateContent.firstElementChild as U;

    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// Project Item
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement>
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

// Project List
class ProjectList extends Component<HTMLDivElement, HTMLElement>
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

// Project Form
class ProjectForm extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

  private gatherUserInput() {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    if (
      validate({ value: title, required: true }) &&
      validate({ value: description, required: true }) &&
      validate({ value: +people, required: true, min: 1, max: 10 })
    ) {
      return { title, description, people: +people };
    }

    alert("Make sure all required fields are filled");
    return;
  }

  private clearUserInputs() {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  }

  @bind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();

    if (userInput) {
      projectState.addProject(
        userInput.title,
        userInput.description,
        userInput.people
      );
      this.clearUserInputs();
    }
  }
}

const projectForm = new ProjectForm();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
