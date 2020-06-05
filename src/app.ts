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
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(fn: Listener) {
    this.listeners.push(fn);
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

// Project List
class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);

    this.configure();
    this.renderContent();
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
      const listItem = document.createElement("li");
      listItem.textContent = project.title;

      listEl?.appendChild(listItem);
    }
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

  renderContent() {}

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }
}

const projectForm = new ProjectForm();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
