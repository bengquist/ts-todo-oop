"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
// Project
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(fn) {
        this.listeners.push(fn);
    }
}
class ProjectState extends State {
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
        if (project) {
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
const projectState = ProjectState.getInstance();
function validate(_a) {
    var { value } = _a, options = __rest(_a, ["value"]);
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
function bind(_, __, desciptor) {
    const newMethod = {
        configurable: true,
        get() {
            const boundMethod = desciptor.value.bind(this);
            return boundMethod;
        },
    };
    return newMethod;
}
// Component Base Class
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const templateContent = document.importNode(this.templateElement.content, true);
        this.element = templateContent.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? "afterbegin" : "beforeend", this.element);
    }
}
// Project Item
let ProjectItem = /** @class */ (() => {
    class ProjectItem extends Component {
        constructor(hostId, project) {
            super("single-project", hostId, true, project.id);
            this.hostId = hostId;
            this.project = project;
            this.configure();
            this.renderContent();
        }
        get people() {
            if (this.project.people === 1) {
                return "1 person assigned";
            }
            else {
                return `${this.project.people} people assigned`;
            }
        }
        dragStartHandler(event) {
            var _a;
            (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", this.project.id);
            event.dataTransfer.effectAllowed = "move";
        }
        dragEndHandler() {
            console.log("drag ended");
        }
        configure() {
            this.element.addEventListener("dragstart", this.dragStartHandler);
            this.element.addEventListener("dragend", this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector("h2").textContent = this.project.title;
            this.element.querySelector("h3").textContent = this.people;
            this.element.querySelector("p").textContent = this.project.description;
        }
    }
    __decorate([
        bind
    ], ProjectItem.prototype, "dragStartHandler", null);
    return ProjectItem;
})();
// Project List
let ProjectList = /** @class */ (() => {
    class ProjectList extends Component {
        constructor(type) {
            super("project-list", "app", false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            var _a;
            if (((_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.types[0]) === "text/plain") {
                event.preventDefault();
                const listElement = this.element.querySelector("ul");
                listElement === null || listElement === void 0 ? void 0 : listElement.classList.add("droppable");
            }
        }
        dropHandler(event) {
            const projectId = event.dataTransfer.getData("text/plain");
            projectState.moveProject(projectId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
        }
        dragLeaveHandler() {
            const listElement = this.element.querySelector("ul");
            listElement === null || listElement === void 0 ? void 0 : listElement.classList.remove("droppable");
        }
        renderContent() {
            const listId = `${this.type}-project-list}`;
            this.element.querySelector("ul").id = listId;
            this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
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
        filterProjects(projects) {
            return projects.filter((project) => {
                if (this.type === "active") {
                    return project.status === ProjectStatus.Active;
                }
                else {
                    return project.status === ProjectStatus.Finished;
                }
            });
        }
        renderProjects() {
            const listEl = document.getElementById(`${this.type}-project-list}`);
            listEl.innerHTML = "";
            for (const project of this.assignedProjects) {
                new ProjectItem(this.element.querySelector("ul").id, project);
            }
        }
    }
    __decorate([
        bind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        bind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        bind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    return ProjectList;
})();
// Project Form
let ProjectForm = /** @class */ (() => {
    class ProjectForm extends Component {
        constructor() {
            super("project-input", "app", true, "user-input");
            this.titleInputElement = this.element.querySelector("#title");
            this.descriptionInputElement = this.element.querySelector("#description");
            this.peopleInputElement = this.element.querySelector("#people");
            this.configure();
        }
        configure() {
            this.element.addEventListener("submit", this.submitHandler);
        }
        renderContent() { }
        gatherUserInput() {
            const title = this.titleInputElement.value;
            const description = this.descriptionInputElement.value;
            const people = this.peopleInputElement.value;
            if (validate({ value: title, required: true }) &&
                validate({ value: description, required: true }) &&
                validate({ value: +people, required: true, min: 1, max: 10 })) {
                return { title, description, people: +people };
            }
            alert("Make sure all required fields are filled");
            return;
        }
        clearUserInputs() {
            this.titleInputElement.value = "";
            this.descriptionInputElement.value = "";
            this.peopleInputElement.value = "";
        }
        submitHandler(event) {
            event.preventDefault();
            const userInput = this.gatherUserInput();
            if (userInput) {
                projectState.addProject(userInput.title, userInput.description, userInput.people);
                this.clearUserInputs();
            }
        }
    }
    __decorate([
        bind
    ], ProjectForm.prototype, "submitHandler", null);
    return ProjectForm;
})();
const projectForm = new ProjectForm();
const activeProjects = new ProjectList("active");
const finishedProjects = new ProjectList("finished");
