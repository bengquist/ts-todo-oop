var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import bind from "../decorators/bind.js";
import Component from "./Component.js";
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
export default ProjectItem;
