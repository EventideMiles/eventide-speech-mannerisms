const MODULE_ID = "eventide-speech-mannerisms";

class EventideSpeechMannerisms {
  static init() {
    console.log("Eventide Speech Mannerisms | Initializing");

    // Expose the API to the game object.
    game.eventide = game.eventide || {};
    game.eventide.speechMannerisms = this;

    // Register hooks.
    Hooks.on("preCreateChatMessage", this.onPreCreateChatMessage.bind(this));
  }

  static setup() {
    // This hook runs once the localization system is ready.
    console.log(game.i18n.localize("esm.init"));
  }

  static openDialog() {
    const tokens = canvas.tokens.controlled;
    if (tokens.length !== 1) {
      ui.notifications.warn(
        game.i18n.localize("esm.notifications.selectOneToken"),
      );
      return;
    }
    const token = tokens[0];
    const actor = token.actor;

    const existingMannerism = actor.getFlag(MODULE_ID, "mannerism") || "";
    const existingPosition = actor.getFlag(MODULE_ID, "position") || "middle";

    new foundry.applications.api.DialogV2({
      window: { title: game.i18n.localize("esm.dialog.title") },
      content: `
        <form>
          <div class="form-group">
            <label>${game.i18n.localize("esm.dialog.mannerismLabel")}</label>
            <input type="text" name="mannerism" value="${existingMannerism}" placeholder="${game.i18n.localize("esm.dialog.mannerismPlaceholder")}">
          </div>
          <div class="form-group">
            <label>${game.i18n.localize("esm.dialog.positionLabel")}</label>
            <select name="position">
              <option value="start" ${existingPosition === "start" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionStart")}</option>
              <option value="middle" ${existingPosition === "middle" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionMiddle")}</option>
              <option value="end" ${existingPosition === "end" ? "selected" : ""}>${game.i18n.localize("esm.dialog.positionEnd")}</option>
            </select>
          </div>
        </form>
      `,
      buttons: [
        {
          action: "submit",
          label: game.i18n.localize("esm.dialog.saveButton"),
          default: true,
          callback: (event, button, dialog) => {
            const form = button.form;
            return {
              mannerism: form.elements.mannerism.value,
              position: form.elements.position.value,
            };
          },
        },
        {
          action: "clear",
          label: game.i18n.localize("esm.dialog.clearButton"),
        },
      ],
      submit: async (result) => {
        if (result === "clear") {
          await actor.unsetFlag(MODULE_ID, "mannerism");
          await actor.unsetFlag(MODULE_ID, "position");
          ui.notifications.info(
            game.i18n.format("esm.notifications.mannerismCleared", {
              actor: actor.name,
            }),
          );
          return;
        }

        if (typeof result === "object" && result !== null) {
          if (result.mannerism) {
            await actor.setFlag(MODULE_ID, "mannerism", result.mannerism);
            await actor.setFlag(MODULE_ID, "position", result.position);
            ui.notifications.info(
              game.i18n.format("esm.notifications.mannerismSet", {
                actor: actor.name,
                mannerism: result.mannerism,
                position: result.position,
              }),
            );
          } else {
            await actor.unsetFlag(MODULE_ID, "mannerism");
            await actor.unsetFlag(MODULE_ID, "position");
            ui.notifications.info(
              game.i18n.format("esm.notifications.mannerismCleared", {
                actor: actor.name,
              }),
            );
          }
        }
      },
      close: () => {},
    }).render({
      position: {
        width: 500,
        height: "auto",
      },
      force: true,
    });
  }

  static onPreCreateChatMessage(message, data, options, userId) {
    if (userId !== game.user.id) {
      return true;
    }

    const actor = game.actors.get(message.speaker.actor);
    if (!actor) {
      return true;
    }

    const mannerism = actor.getFlag(MODULE_ID, "mannerism");
    const position = actor.getFlag(MODULE_ID, "position");

    if (!mannerism) {
      return true;
    }

    const escapedMannerism = mannerism.replace(
      /[-\/\\^$*+?.()|[\]{}]/g,
      "\\$&",
    );
    const regexString = escapedMannerism.split("").join("[-.,\\s]*");
    let finalRegex;

    switch (position) {
      case "start":
        finalRegex = new RegExp(`^\\s*${regexString}`, "i");
        break;
      case "end":
        finalRegex = new RegExp(`${regexString}\\s*$`, "i");
        break;
      case "middle":
      default:
        finalRegex = new RegExp(regexString, "i");
        break;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = message.content;
    const strippedContent = tempDiv.textContent || tempDiv.innerText || "";

    if (!finalRegex.test(strippedContent)) {
      ui.notifications.error(
        game.i18n.format("esm.notifications.validationError", {
          actor: actor.name,
          mannerism: mannerism,
          position: position,
        }),
      );
      return false;
    }

    return true;
  }
}

Hooks.once(
  "init",
  EventideSpeechMannerisms.init.bind(EventideSpeechMannerisms),
);
Hooks.once(
  "setup",
  EventideSpeechMannerisms.setup.bind(EventideSpeechMannerisms),
);
