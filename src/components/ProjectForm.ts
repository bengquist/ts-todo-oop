import bind from "../decorators/bind";
import { projectState } from "../state/prrojectState";
import validate from "../util/validate";
import Component from "./Component";

export default class ProjectForm extends Component<
  HTMLDivElement,
  HTMLFormElement
> {
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
