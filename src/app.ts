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

// Project List
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  sectionElement: HTMLElement;
  assignedProjects: Project[] = [];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById("app") as HTMLDivElement;

    const templateContent = document.importNode(
      this.templateElement.content,
      true
    );

    this.sectionElement = templateContent.firstElementChild as HTMLElement;
    this.sectionElement.id = `${type}-projects`;

    projectState.addListener((projects) => {
      const filteredProjects = this.filterProjects(projects);

      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });

    this.attach();
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

  private renderContent() {
    const listId = `${this.type}-project-list}`;
    this.sectionElement.querySelector("ul")!.id = listId;
    this.sectionElement.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.sectionElement);
  }
}

// Project Form
class ProjectForm {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLFormElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    ) as HTMLTemplateElement;
    this.hostElement = document.getElementById("app") as HTMLDivElement;

    const templateContent = document.importNode(
      this.templateElement.content,
      true
    );

    this.formElement = templateContent.firstElementChild as HTMLFormElement;
    this.formElement.id = "user-input";

    this.titleInputElement = this.formElement.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.formElement.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
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

  private configure() {
    this.formElement.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.formElement);
  }
}

const projectForm = new ProjectForm();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
