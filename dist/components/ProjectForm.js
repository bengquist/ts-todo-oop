var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import bind from "../decorators/bind.js";
import { projectState } from "../state/prrojectState.js";
import validate from "../util/validate.js";
import Component from "./Component.js";
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
export default ProjectForm;
